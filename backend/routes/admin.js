const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { adminAuth } = require("../middleware/adminAuth");
const Admin = require("../models/Admin");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const User = require("../models/User");
const EmailLog = require("../models/EmailLog");
const { fetchRepoData } = require("../services/githubService");
const { evaluateProject } = require("../services/aiService");
const { sendAdminBlast } = require("../services/emailService");

const genToken = (id) => jwt.sign({ id }, process.env.ADMIN_JWT_SECRET, { expiresIn: process.env.ADMIN_JWT_EXPIRES || "8h" });

// ─── POST /api/admin/auth/login  ─────────────────────────────────────────────
router.post("/auth/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const admin = await Admin.findOne({ email: req.body.email }).select("+password");
      if (!admin || !(await admin.comparePassword(req.body.password))) {
        return res.status(401).json({ success: false, message: "Invalid credentials." });
      }
      admin.lastLogin = new Date();
      await admin.save();
      const token = genToken(admin._id);
      res.json({ success: true, token, admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ─── GET /api/admin/auth/me  ─────────────────────────────────────────────────
router.get("/auth/me", adminAuth, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// ══════════════════════════════════════════════════════════════════════════════
// ASSIGNMENTS
// ══════════════════════════════════════════════════════════════════════════════

router.get("/assignments", adminAuth, async (req, res) => {
  try {
    const assignments = await Assignment.find().populate("createdBy", "name email").sort({ createdAt: -1 });
    res.json({ success: true, assignments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post("/assignments", adminAuth, async (req, res) => {
  try {
    const { title, description, rules, criteria, difficulty, deadline, tags, isPremium, requiredPlan, coverImage, prize } = req.body;
    const a = await Assignment.create({ title, description, rules: rules || "", criteria: criteria || "", difficulty, deadline, tags: tags || [], isPremium: isPremium || false, requiredPlan: requiredPlan || "free", coverImage, prize, createdBy: req.admin._id });
    res.status(201).json({ success: true, assignment: a });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put("/assignments/:id", adminAuth, async (req, res) => {
  try {
    const a = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!a) return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, assignment: a });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete("/assignments/:id", adminAuth, async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted." });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// SUBMISSIONS - manual AI evaluation + admin review
// ══════════════════════════════════════════════════════════════════════════════

router.get("/submissions", adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const subs = await Submission.find(query)
      .populate("userId", "name username email")
      .populate("assignmentId", "title difficulty")
      .sort({ createdAt: -1 });
    res.json({ success: true, submissions: subs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Trigger AI evaluation (admin presses button)
router.post("/submissions/:id/evaluate", adminAuth, async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: "Not found." });

    // Fetch GitHub data
    const { repoData, error } = await fetchRepoData(sub.repoLink);
    if (error) console.warn("GitHub warning:", error);

    // AI evaluation
    const evaluation = await evaluateProject(repoData, sub.description);

    sub.aiScore = evaluation.score;
    sub.aiFeedback = { strengths: evaluation.strengths, weaknesses: evaluation.weaknesses, suggestions: evaluation.suggestions, rawText: evaluation.rawText };
    sub.aiEvaluatedAt = new Date();
    sub.status = "ai_evaluated";
    await sub.save();

    res.json({ success: true, message: "AI evaluation complete.", submission: sub });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Admin review: set score, note, approve/reject/publish
router.patch("/submissions/:id/review", adminAuth, async (req, res) => {
  try {
    const { adminScore, adminNote, action } = req.body;
    // action: "approve" | "reject" | "publish"

    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: "Not found." });

    if (adminScore !== undefined) sub.adminScore = adminScore;
    if (adminNote !== undefined) sub.adminNote = adminNote;
    sub.reviewedBy = req.admin._id;
    sub.reviewedAt = new Date();

    if (action === "publish") {
      sub.status = "published";
      sub.computeFinalScore();
      // Recompute ranks for this assignment
      await recomputeRanks(sub.assignmentId);
      // Update user total score
      await updateUserScore(sub.userId);
    } else if (action === "reject") {
      sub.status = "rejected";
    } else {
      sub.status = "admin_reviewed";
    }

    await sub.save();
    res.json({ success: true, submission: sub });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

const recomputeRanks = async (assignmentId) => {
  const subs = await Submission.find({ assignmentId, status: "published" }).sort({ finalScore: -1 });
  for (let i = 0; i < subs.length; i++) {
    subs[i].rank = i + 1;
    await subs[i].save();
  }
};

const updateUserScore = async (userId) => {
  const subs = await Submission.find({ userId, status: "published" });
  const avg = subs.reduce((a, s) => a + (s.finalScore || 0), 0) / (subs.length || 1);
  await User.findByIdAndUpdate(userId, { totalScore: Math.round(avg) });
};

// ══════════════════════════════════════════════════════════════════════════════
// USERS
// ══════════════════════════════════════════════════════════════════════════════

router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-firebaseUid").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Admin grants plan manually
router.patch("/users/:id/plan", adminAuth, async (req, res) => {
  try {
    const { plan, days } = req.body;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (days || 30));
    const user = await User.findByIdAndUpdate(req.params.id, { plan, planExpiresAt: expiresAt, planActivatedAt: new Date() }, { new: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// EMAIL BLAST
// ══════════════════════════════════════════════════════════════════════════════

router.post("/email/blast", adminAuth, async (req, res) => {
  try {
    const { subject, htmlBody, targetPlan } = req.body;
    if (!subject || !htmlBody) return res.status(400).json({ success: false, message: "Subject and body required." });

    const query = targetPlan ? { plan: targetPlan } : {};
    const recipients = await User.find(query).select("email name _id");

    if (!recipients.length) return res.status(400).json({ success: false, message: "No recipients found." });

    // Fire async, respond immediately
    sendAdminBlast({ recipients, subject, htmlBody, adminId: req.admin._id });

    res.json({ success: true, message: `Email blast queued for ${recipients.length} users.`, count: recipients.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get("/email/logs", adminAuth, async (req, res) => {
  try {
    const logs = await EmailLog.find().populate("userId", "name email").sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, logs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// STATS
// ══════════════════════════════════════════════════════════════════════════════

router.get("/stats", adminAuth, async (req, res) => {
  try {
    const [users, assignments, submissions, pending] = await Promise.all([
      User.countDocuments(),
      Assignment.countDocuments({ isActive: true }),
      Submission.countDocuments({ status: "published" }),
      Submission.countDocuments({ status: { $in: ["pending", "ai_evaluated"] } }),
    ]);
    const premiumUsers = await User.countDocuments({ plan: { $ne: "free" } });
    res.json({ success: true, stats: { users, assignments, submissions, pendingReview: pending, premiumUsers } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
