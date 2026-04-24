import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";

// User pages
import Navbar from "./components/Navbar";
import Home from "./pages/user/Home";
import Login from "./pages/user/Login";
import Dashboard from "./pages/user/Dashboard";
import Challenges from "./pages/user/Challenges";
import ChallengeDetail from "./pages/user/ChallengeDetail";
import SubmitProject from "./pages/user/SubmitProject";
import SubmissionDetail from "./pages/user/SubmissionDetail";
import Leaderboard from "./pages/user/Leaderboard";
import ProjectLeaderboard from "./pages/user/ProjectLeaderboard";
import Profile from "./pages/user/Profile";
import Pricing from "./pages/user/Pricing";
import LoadingScreen from "./components/ui/LoadingScreen";

// Admin portal pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminChallenges from "./pages/admin/AdminChallenges";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminEmailBlast from "./pages/admin/AdminEmailBlast";

// ─── Guards ──────────────────────────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { user, firebaseUser, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (user || firebaseUser)
    ? children
    : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

const AdminRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  if (loading) return <LoadingScreen />;
  return admin ? children : <Navigate to="/admin-portal/login" replace />;
};

// ─── User App ─────────────────────────────────────────────────────────────────
const UserApp = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/challenges/:id" element={<ChallengeDetail />} />
        <Route path="/challenges/:id/submit" element={<PrivateRoute><SubmitProject /></PrivateRoute>} />
        <Route path="/submissions/:id" element={<PrivateRoute><SubmissionDetail /></PrivateRoute>} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/leaderboard/challenge/:id" element={<ProjectLeaderboard />} />
        {/* Unique profile route per user: /u/username */}
        <Route path="/u/:username" element={<Profile />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  </div>
);

// ─── Admin Portal App ─────────────────────────────────────────────────────────
const AdminPortalApp = () => (
  <Routes>
    <Route path="login" element={<AdminLogin />} />
    <Route path="/*" element={
      <AdminRoute>
        <AdminLayout>
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/challenges" element={<AdminChallenges />} />
            <Route path="/submissions" element={<AdminSubmissions />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/email" element={<AdminEmailBlast />} />
            <Route path="*" element={<Navigate to="/admin-portal" replace />} />
          </Routes>
        </AdminLayout>
      </AdminRoute>
    } />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <Routes>
            {/* Admin portal - completely separate section */}
            <Route path="/admin-portal/*" element={<AdminPortalApp />} />
            {/* User-facing app */}
            <Route path="/*" element={<UserApp />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: "#0c0c0c", color: "#F0F0F0", border: "1px solid rgba(255,255,255,0.07)", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", borderRadius: "12px" },
              success: { iconTheme: { primary: "#34D399", secondary: "#0c0c0c" } },
              error: { iconTheme: { primary: "#F87171", secondary: "#0c0c0c" } },
            }}
          />
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
