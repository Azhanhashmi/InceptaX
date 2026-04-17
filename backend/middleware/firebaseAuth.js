const admin = require("firebase-admin");
const User = require("../models/User");

// ─── Initialize Firebase Admin (lazy, once) ─────────────────────────────────
let firebaseInitialized = false;

const initFirebase = () => {
  if (firebaseInitialized) return;
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    firebaseInitialized = true;
    console.log("✅ Firebase Admin initialized");
  } catch (err) {
    console.warn("⚠️  Firebase not configured — using mock auth:", err.message);
  }
};

// ─── Middleware: verify Firebase ID token ────────────────────────────────────
const firebaseAuth = async (req, res, next) => {
  try {
    initFirebase();

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided." });
    }

    const idToken = authHeader.split("Bearer ")[1];

    if (!firebaseInitialized) {
      return devAuthFallback(req, res, next, idToken);
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    req.firebaseUser = decoded;

    // 🔥 CHANGE HERE
    let user = await User.findOne({ firebaseUid: decoded.uid });

    // ✅ Don't block — just attach if exists
    if (user) {
      req.user = user;
    }

    next(); // ✅ ALWAYS continue
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid authentication token." });
  }
};

// ─── Dev fallback when Firebase is not configured ───────────────────────────
const devAuthFallback = async (req, res, next, token) => {
  try {
    // In dev: token is just a MongoDB user ID
    const user = await User.findById(token);
    if (!user) {
      return res.status(401).json({ success: false, message: "Dev auth: user not found." });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Dev auth failed." });
  }
};

// ─── Optional auth (doesn't fail if no token) ────────────────────────────────
const optionalAuth = async (req, res, next) => {
  if (!req.headers.authorization) return next();
  return firebaseAuth(req, res, next);
};

module.exports = { firebaseAuth, optionalAuth, initFirebase };
