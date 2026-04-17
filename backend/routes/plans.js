const express = require("express");
const router = express.Router();
const { firebaseAuth } = require("../middleware/firebaseAuth");
const User = require("../models/User");
const { sendPlanUpgradeEmail } = require("../services/emailService");

const PLAN_DURATIONS = {
  ten_day: 10,   // days
  monthly: 30,   // days
};

const PLAN_PRICES = {
  ten_day: 99,   // INR
  monthly: 199,  // INR
};

// ─── GET /api/plans  (public pricing info) ───────────────────────────────────
router.get("/", (req, res) => {
  res.json({
    success: true,
    plans: [
      {
        id: "free",
        name: "Free",
        price: 0,
        currency: "INR",
        duration: null,
        features: [
          "Access to all free challenges",
          "AI-evaluated feedback (after admin review)",
          "Public portfolio profile",
          "Project leaderboard ranking",
        ],
        notIncluded: ["Premium challenges", "Team collaboration", "Real-time chat"],
      },
      {
        id: "ten_day",
        name: "10-Day Premium",
        price: 99,
        currency: "INR",
        duration: 10,
        features: [
          "Everything in Free",
          "Access to ALL premium challenges",
          "Team collaboration (up to 3 members)",
          "Real-time team chat",
          "Priority AI evaluation",
        ],
        notIncluded: [],
        popular: false,
      },
      {
        id: "monthly",
        name: "Monthly Premium",
        price: 199,
        currency: "INR",
        duration: 30,
        features: [
          "Everything in 10-Day",
          "Unlimited team members",
          "Exclusive monthly challenges",
          "Badge on profile",
          "Early access to new features",
        ],
        notIncluded: [],
        popular: true,
      },
    ],
  });
});

// ─── POST /api/plans/upgrade  ────────────────────────────────────────────────
// In production: integrate Razorpay/Stripe here
// For now: admin can grant plans; this is a demo endpoint
router.post("/upgrade", firebaseAuth, async (req, res) => {
  try {
    const { plan, paymentId } = req.body; // paymentId from Razorpay/Stripe

    if (!["ten_day", "monthly"].includes(plan)) {
      return res.status(400).json({ success: false, message: "Invalid plan." });
    }

    // TODO: Verify payment with Razorpay/Stripe before activating
    // const verified = await verifyPayment(paymentId, PLAN_PRICES[plan]);

    const durationDays = PLAN_DURATIONS[plan];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { plan, planExpiresAt: expiresAt, planActivatedAt: new Date() },
      { new: true }
    );

    // Send upgrade notification email
    sendPlanUpgradeEmail(user, plan);

    res.json({ success: true, message: `${plan} plan activated!`, user, expiresAt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
