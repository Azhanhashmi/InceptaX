const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    to: { type: String, required: true },   // recipient email
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    type: {
      type: String,
      enum: ["welcome", "admin_blast", "plan_upgrade", "submission_result", "custom"],
      required: true,
    },
    subject: { type: String, required: true },
    body: { type: String },
    status: { type: String, enum: ["sent", "failed"], default: "sent" },
    error: { type: String, default: "" },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null }, // null = system
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailLog", emailLogSchema);
