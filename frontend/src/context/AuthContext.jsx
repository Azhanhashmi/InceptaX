import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../lib/firebase";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null); // MongoDB profile
  const [loading, setLoading] = useState(true);

  // ─── Sync MongoDB profile after Firebase auth ─────────────────────────────
  const syncProfile = async (fbUser, extraData = {}) => {
    try {
      const token = await fbUser.getIdToken();
      const res = await api.post("/users/sync",
        { name: fbUser.displayName || extraData.name || "User" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      console.error("Profile sync failed:", err.message);
      return null;
    }
  };

  // ─── Listen to Firebase auth state ───────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
  setFirebaseUser(fbUser);

  if (fbUser) {
    setLoading(false); // ✅ allow UI immediately

    // run profile sync in background (non-blocking)
    syncProfile(fbUser);
  } else {
    setUser(null);
    setLoading(false);
  }
});
    return unsub;
  }, []);

  // ─── Get current Firebase ID token (for API calls) ────────────────────────
  const getToken = async () => {
    if (!firebaseUser) return null;
    return firebaseUser.getIdToken();
  };

  // ─── Email/password register ──────────────────────────────────────────────
const registerWithEmail = async (email, password, name) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  setFirebaseUser(cred.user); // ✅ IMPORTANT
  setLoading(false);

  syncProfile(cred.user, { name }); // background
};

  // ─── Email/password login ─────────────────────────────────────────────────
 const loginWithEmail = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);

  setFirebaseUser(cred.user); // ✅ IMPORTANT
  setLoading(false);

  syncProfile(cred.user); // background
};

const loginWithGoogle = async () => {
  const cred = await signInWithPopup(auth, googleProvider);

  setFirebaseUser(cred.user); // ✅ CRITICAL FIX
  setLoading(false);

  syncProfile(cred.user); // background
};

// ─── GitHub sign-in ───────────────────────────────────────────────────────
const loginWithGitHub = async () => {
  const cred = await signInWithPopup(auth, githubProvider);

  setFirebaseUser(cred.user); // ✅ IMPORTANT
  setLoading(false);

  syncProfile(cred.user); // background
};

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  const updateUserProfile = (updates) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  };

  return (
    <AuthContext.Provider value={{
      user, firebaseUser, loading,
      registerWithEmail, loginWithEmail, loginWithGoogle, loginWithGitHub,
      logout, getToken, updateUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
