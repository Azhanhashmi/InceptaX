const express = require("express");
const router = express.Router();
const { firebaseAuth, optionalAuth } = require("../middleware/firebaseAuth");
const Assignment = require("../models/Assignment");

// ─── GET /api/assignments  (public) ──────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { difficulty, search, premium, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (difficulty) query.difficulty = difficulty;
    if (search) query.title = { $regex: search, $options: "i" };
    if (premium === "true") query.isPremium = true;
    if (premium === "false") query.isPremium = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Assignment.countDocuments(query);
    const assignments = await Assignment.find(query)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, assignments, total, pages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/assignments/:id  (public) ──────────────────────────────────────
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const a = await Assignment.findById(req.params.id).populate("createdBy", "name");
    if (!a) return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, assignment: a });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
