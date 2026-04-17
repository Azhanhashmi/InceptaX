const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");

// ─── GET /api/leaderboard  (global) ──────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const board = await Submission.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$userId", bestScore: { $max: "$finalScore" }, totalSubmissions: { $sum: 1 }, avgAiScore: { $avg: "$aiScore" } } },
      { $sort: { bestScore: -1 } },
      { $limit: 100 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { userId: "$_id", name: "$user.name", username: "$user.username", profileImage: "$user.profileImage", plan: "$user.plan", bestScore: { $round: ["$bestScore", 1] }, totalSubmissions: 1, avgAiScore: { $round: ["$avgAiScore", 1] } } },
    ]);
    const ranked = board.map((e, i) => ({ ...e, rank: i + 1 }));
    res.json({ success: true, leaderboard: ranked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/leaderboard/assignment/:id  (per-project) ──────────────────────
router.get("/assignment/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).select("title difficulty");
    if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found." });

    const subs = await Submission.find({ assignmentId: req.params.id, status: "published" })
      .populate("userId", "name username profileImage plan")
      .sort({ finalScore: -1 });

    const ranked = subs.map((s, i) => ({ ...s.toJSON(), rank: i + 1 }));
    res.json({ success: true, assignment, leaderboard: ranked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
