const express = require("express");
const router = express.Router();
const { firebaseAuth } = require("../middleware/firebaseAuth");
const { requirePremium } = require("../middleware/planGuard");
const TeamMessage = require("../models/TeamMessage");
const Submission = require("../models/Submission");

// Check if user can access this submission's chat
const canAccessChat = async (userId, submissionId) => {
  const sub = await Submission.findById(submissionId);
  if (!sub) return false;
  const isOwner = sub.userId.toString() === userId.toString();
  const isTeamMember = sub.teamMembers?.some((m) => m.toString() === userId.toString());
  return isOwner || isTeamMember;
};

// ─── GET /api/chat/:submissionId  (get message history) ─────────────────────
router.get("/:submissionId", firebaseAuth, requirePremium, async (req, res) => {
  try {
    const allowed = await canAccessChat(req.user._id, req.params.submissionId);
    if (!allowed) return res.status(403).json({ success: false, message: "Not a team member." });

    const messages = await TeamMessage.find({ submissionId: req.params.submissionId })
      .populate("senderId", "name username profileImage")
      .sort({ createdAt: 1 })
      .limit(200);

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/chat/:submissionId  (send message) ────────────────────────────
router.post("/:submissionId", firebaseAuth, requirePremium, async (req, res) => {
  try {
    const allowed = await canAccessChat(req.user._id, req.params.submissionId);
    if (!allowed) return res.status(403).json({ success: false, message: "Not a team member." });

    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: "Message cannot be empty." });

    const msg = await TeamMessage.create({
      submissionId: req.params.submissionId,
      senderId: req.user._id,
      text: text.trim(),
    });

    const populated = await msg.populate("senderId", "name username profileImage");

    // Emit via Socket.io to the room
    const io = req.app.get("io");
    io.to(`submission_${req.params.submissionId}`).emit("new_message", populated);

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
