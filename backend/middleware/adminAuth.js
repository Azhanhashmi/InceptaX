const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// Admin uses classic JWT (no Firebase)
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Admin token required." });
    }
    const token = authHeader.split("Bearer ")[1];
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ success: false, message: "Admin not found." });
    }
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired admin token." });
  }
};

// Super admin only
const superAdminOnly = (req, res, next) => {
  if (req.admin?.role === "super_admin") return next();
  return res.status(403).json({ success: false, message: "Super admin access required." });
};

module.exports = { adminAuth, superAdminOnly };
