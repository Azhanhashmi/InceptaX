require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const { initFirebase } = require("./middleware/firebaseAuth");

// Routes
const userRoutes = require("./routes/users");
const assignmentRoutes = require("./routes/assignments");
const submissionRoutes = require("./routes/submissions");
const leaderboardRoutes = require("./routes/leaderboard");
const chatRoutes = require("./routes/chat");
const planRoutes = require("./routes/plans");
const adminRoutes = require("./routes/admin");

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io (team chat) ───────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true },
});

// Attach io to app for use in controllers
app.set("io", io);

io.on("connection", (socket) => {
  // Join a submission's chat room
  socket.on("join_room", (submissionId) => {
    socket.join(`submission_${submissionId}`);
  });
  socket.on("leave_room", (submissionId) => {
    socket.leave(`submission_${submissionId}`);
  });
  socket.on("disconnect", () => {});
});

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/users", userRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/admin", adminRoutes); // Admin portal API

app.get("/api/health", (_, res) => res.json({ status: "InceptaX API running 🚀" }));

// ─── Error handler ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || "Server error" });
});

app.get("/", (req, res) => {
  res.json({
    message: "InceptaX API running",
    status: "OK"
  });
});

// ─── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    initFirebase();
    httpServer.listen(PORT, () =>
      console.log(`🚀 InceptaX server → http://localhost:${PORT}`)
    );
  })
  .catch((err) => { console.error("❌ DB Error:", err.message); process.exit(1); });
