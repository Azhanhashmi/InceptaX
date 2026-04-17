const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    repoLink: { type: String, required: true, trim: true },
    liveLink: { type: String, trim: true, default: "" },
    description: { type: String, required: true, maxlength: 1500 },

    // ─── Team members (premium only) ───────────────────────────────────────
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ─── AI Evaluation (run by admin, not automatic) ───────────────────────
    aiScore: { type: Number, min: 0, max: 100, default: null },
    aiFeedback: {
      strengths: [String],
      weaknesses: [String],
      suggestions: [String],
      rawText: String,
    },
    aiEvaluatedAt: { type: Date, default: null },

    // ─── Admin review ─────────────────────────────────────────────────────
    adminScore: { type: Number, min: 0, max: 100, default: null },
    adminNote: { type: String, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    reviewedAt: { type: Date, default: null },

    // ─── Status lifecycle ─────────────────────────────────────────────────
    // pending → ai_evaluated → admin_reviewed → published | rejected
    status: {
      type: String,
      enum: ["pending", "ai_evaluated", "admin_reviewed", "published", "rejected"],
      default: "pending",
    },

    // ─── Final score (only set when published) ────────────────────────────
    finalScore: { type: Number, default: 0 },

    // ─── Rank within assignment (computed on publish) ─────────────────────
    rank: { type: Number, default: null },
  },
  { timestamps: true }
);

// Prevent duplicate submissions
submissionSchema.index({ userId: 1, assignmentId: 1 }, { unique: true });

// Compute final = 70% AI + 30% Admin (no votes)
submissionSchema.methods.computeFinalScore = function () {
  const ai = this.aiScore || 0;
  const admin = this.adminScore !== null ? this.adminScore : ai;
  this.finalScore = Math.round(ai * 0.7 + admin * 0.3);
  return this.finalScore;
};

module.exports = mongoose.model("Submission", submissionSchema);
