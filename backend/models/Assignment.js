const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 3000 },
    rules: { type: String, default: "" },
   criteria: { type: String, default: "" },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    deadline: { type: Date, required: true },
    tags: [{ type: String, trim: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    isActive: { type: Boolean, default: true },
    submissionsCount: { type: Number, default: 0 },
    // ─── Premium gate ──────────────────────────────────────────────────────
    isPremium: {
      type: Boolean,
      default: false, // If true, only paid users can submit
    },
    requiredPlan: {
      type: String,
      enum: ["free", "ten_day", "monthly"],
      default: "free", // free = anyone, ten_day+ = paid required
    },
    // ─── Cover image URL (optional) ────────────────────────────────────────
    coverImage: { type: String, default: "" },
    // ─── Prize / reward text ───────────────────────────────────────────────
    prize: { type: String, default: "" },
  },
  { timestamps: true }
);

assignmentSchema.virtual("isExpired").get(function () {
  return new Date() > this.deadline;
});

assignmentSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Assignment", assignmentSchema);
