const express = require("express");
const router = express.Router();
const { firebaseAuth, optionalAuth } = require("../middleware/firebaseAuth");
const { requirePremium } = require("../middleware/planGuard");
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const User = require("../models/User");

// ─── POST /api/submissions  ──────────────────────────────────────────────────
router.post("/", firebaseAuth, async (req, res) => {
  try {
    const { assignmentId, repoLink, liveLink, description, teamMemberUsernames } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment)
      return res.status(404).json({ success: false, message: "Assignment not found." });

    // Premium gate check
    if (assignment.isPremium || assignment.requiredPlan !== "free") {
      const user = req.user;
      const planOrder = { free: 0, ten_day: 1, monthly: 2 };
      const required = planOrder[assignment.requiredPlan] || 1;
      const userLevel = planOrder[user.plan] || 0;

      if (
        userLevel < required ||
        (user.plan !== "free" &&
          user.planExpiresAt &&
          new Date() > user.planExpiresAt)
      ) {
        return res.status(403).json({
          success: false,
          message: "This is a premium challenge. Please upgrade your plan.",
          code: "UPGRADE_REQUIRED",
        });
      }
    }

    // Duplicate check
    const existing = await Submission.findOne({
      userId: req.user._id,
      assignmentId,
    });

    if (existing)
      return res.status(400).json({
        success: false,
        message: "You have already submitted for this challenge.",
      });

    // Team members
    let teamMembers = [];
    if (teamMemberUsernames?.length && req.user.isPremium) {
      const members = await User.find({
        username: { $in: teamMemberUsernames },
      }).select("_id");

      teamMembers = members.map((m) => m._id);
    }

    const submission = await Submission.create({
      userId: req.user._id,
      assignmentId,
      repoLink,
      liveLink,
      description,
      teamMembers,
      status: "pending",
    });

    // update counters
    await Assignment.findByIdAndUpdate(assignmentId, {
      $inc: { submissionsCount: 1 },
    });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { submissionsCount: 1 },
    });

    // email (safe version)
    const user = await User.findById(req.user._id);

    sendEmail({
      to: user.email,
      subject: "Submission Received 🚀",
      html: `
        <h2>Submission Received</h2>
        <p>Your project has been submitted successfully.</p>
        <p>We will review it and update you soon.</p>
      `,
      attachments: [
        {
          filename: "submission.txt",
          content: `Repo: ${repoLink}\nLive: ${liveLink}\nDescription: ${description}`,
        },
      ],
      userId: user._id,
      type: "submission_result",
    }).catch((err) => console.error("Email error:", err));

    return res.status(201).json({
      success: true,
      message: "Submission received! Awaiting admin review.",
      submission,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted.",
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
// ─── GET /api/submissions/mine  (own submissions) ────────────────────────────
router.get("/mine", firebaseAuth, async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user._id })
      .populate("assignmentId", "title difficulty isPremium")
      .sort({ createdAt: -1 });
    res.json({ success: true, submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/submissions/:id  (public) ──────────────────────────────────────
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id)
      .populate("userId", "name username profileImage bio plan")
      .populate("assignmentId", "title description difficulty")
      .populate("teamMembers", "name username profileImage");

    if (!sub) return res.status(404).json({ success: false, message: "Submission not found." });

    // Hide AI feedback if not published yet (only owner or admin can see pending)
    const isOwner = req.user?._id?.toString() === sub.userId?._id?.toString();
    const isTeamMember = sub.teamMembers?.some(m => m._id?.toString() === req.user?._id?.toString());
    if (sub.status !== "published" && !isOwner && !isTeamMember) {
      return res.status(403).json({ success: false, message: "Submission not yet published." });
    }

    res.json({ success: true, submission: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/submissions/assignment/:assignmentId  (leaderboard per project) 
router.get("/assignment/:assignmentId", async (req, res) => {
  try {
    const subs = await Submission.find({
      assignmentId: req.params.assignmentId,
      status: "published",
    })
      .populate("userId", "name username profileImage plan")
      .sort({ finalScore: -1 });

    // Add rank numbers
    const ranked = subs.map((s, i) => ({ ...s.toJSON(), rank: i + 1 }));
    res.json({ success: true, count: ranked.length, submissions: ranked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/submissions/user/:username  (portfolio) ────────────────────────
router.get("/user/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const submissions = await Submission.find({ userId: user._id, status: "published" })
      .populate("assignmentId", "title difficulty")
      .sort({ finalScore: -1 });

    res.json({ success: true, submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
