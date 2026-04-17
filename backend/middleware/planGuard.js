// Checks if user has an active paid plan
const requirePlan = (...allowedPlans) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Not authenticated." });

    const planOrder = { free: 0, ten_day: 1, monthly: 2 };
    const userLevel = planOrder[user.plan] ?? 0;
    const minRequired = Math.min(...allowedPlans.map((p) => planOrder[p] ?? 99));

    // Check plan level
    if (userLevel < minRequired) {
      return res.status(403).json({
        success: false,
        message: "This feature requires a premium plan.",
        code: "UPGRADE_REQUIRED",
        requiredPlans: allowedPlans,
      });
    }

    // Check expiry for paid plans
    if (user.plan !== "free" && user.planExpiresAt) {
      if (new Date() > new Date(user.planExpiresAt)) {
        return res.status(403).json({
          success: false,
          message: "Your plan has expired. Please renew to continue.",
          code: "PLAN_EXPIRED",
        });
      }
    }

    next();
  };
};

// Shorthand: any paid plan
const requirePremium = requirePlan("ten_day", "monthly");

module.exports = { requirePlan, requirePremium };
