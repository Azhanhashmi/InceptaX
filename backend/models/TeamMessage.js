const mongoose = require("mongoose");

// Team conversation within a submission (premium only)
const teamMessageSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

teamMessageSchema.index({ submissionId: 1, createdAt: 1 });

module.exports = mongoose.model("TeamMessage", teamMessageSchema);
