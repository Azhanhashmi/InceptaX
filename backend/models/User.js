const mongoose = require("mongoose");

const PLANS = ["free", "ten_day", "monthly"];

const userSchema = new mongoose.Schema(
  {
    // Firebase UID links this doc to Firebase Auth
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Unique username for profile URL: /u/:username
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9_-]{3,30}$/, "Username must be 3-30 chars, letters/numbers/_ only"],
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    bio: { type: String, maxlength: 300, default: "" },
    profileImage: { type: String, default: "" },
    githubUsername: { type: String, default: "" },
    // ─── Plan / Subscription ───────────────────────────────────────────────
    plan: {
      type: String,
      enum: PLANS,
      default: "free",
    },
    planExpiresAt: {
      type: Date,
      default: null, // null = no expiry (free) or perpetual
    },
    planActivatedAt: {
      type: Date,
      default: null,
    },
    // ─── Stats ────────────────────────────────────────────────────────────
    totalScore: { type: Number, default: 0 },
    submissionsCount: { type: Number, default: 0 },
    // ─── Welcome email sent flag ──────────────────────────────────────────
    welcomeEmailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── Virtual: isPremium ─────────────────────────────────────────────────────
userSchema.virtual("isPremium").get(function () {
  if (this.plan === "free") return false;
  if (!this.planExpiresAt) return false;
  return new Date() < new Date(this.planExpiresAt);
});

// ─── Virtual: canUseTeams ───────────────────────────────────────────────────
userSchema.virtual("canUseTeams").get(function () {
  return this.isPremium;
});

userSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
