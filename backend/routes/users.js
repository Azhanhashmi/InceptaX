const express = require("express");
const router = express.Router();
const { firebaseAuth, optionalAuth } = require("../middleware/firebaseAuth");
const User = require("../models/User");
const { sendWelcomeEmail } = require("../services/emailService");

// ─── POST /api/users/sync  ────────────────────────────────────────────────────
// Called after Firebase login to create/sync MongoDB profile
router.post("/sync", firebaseAuth, async (req, res) => {
  try {
    const { firebaseUid, email, name, profileImage } = req.firebaseUser
      ? {
          firebaseUid: req.firebaseUser.uid,
          email: req.firebaseUser.email,
          name: req.firebaseUser.name || req.body.name || "User",
         profileImage:
  req.firebaseUser?.picture ||
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        }
      : req.body;

    let user = await User.findOne({ firebaseUid: req.firebaseUser?.uid || firebaseUid });
    let isNew = false;

    if (!user) {
      // Generate unique username from name/email
      const base = (name || email.split("@")[0])
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 20) || "user";
      let username = base;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${base}${counter++}`;
      }

      user = await User.create({
        firebaseUid: req.firebaseUser?.uid || firebaseUid,
        username,
        name,
        email,
        profileImage: profileImage || "",
        plan: "free",
      });
      isNew = true;
    }

    // Send welcome email on first sign-in (async, don't await)
    if (isNew || !user.welcomeEmailSent) {
      sendWelcomeEmail(user).then(async () => {
        await User.findByIdAndUpdate(user._id, { welcomeEmailSent: true });
      });
    }

    res.json({ success: true, user, isNew });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/users/me  ───────────────────────────────────────────────────────
router.get("/me", firebaseAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ─── GET /api/users/:username  (public profile by username) ─────────────────
router.get("/:username", optionalAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-firebaseUid -welcomeEmailSent");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/users/me/profile  ───────────────────────────────────────────────
router.put("/me/profile", firebaseAuth, async (req, res) => {
  try {
    const { name, bio, profileImage, githubUsername, username } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (profileImage !== undefined) updates.profileImage = profileImage;
    if (githubUsername !== undefined) updates.githubUsername = githubUsername;

    if (username) {
      const conflict = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (conflict) return res.status(400).json({ success: false, message: "Username taken." });
      updates.username = username.toLowerCase().trim();
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
