// src/context/authContext.js
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../firebase";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// Normalize roles so routes + UI never fight about role strings
const normalizeRole = (raw) => {
  const r = String(raw || "").toLowerCase().trim().replace(/\s+/g, "");

  if (r === "admin") return "admin";
  if (["consumer", "user", "customer"].includes(r)) return "consumer";
  if (["helpdeskagent", "helpdesk", "agent", "support"].includes(r)) return "agent";
  if (r === "pending") return "pending";

  return "pending";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { uid, email, name, role, company }
  const [loading, setLoading] = useState(true);

  // 🔑 helper: get current user's ID token for backend auth
  const getIdToken = async () => {
    const current = auth.currentUser;
    if (!current) throw new Error("User not logged in");
    return current.getIdToken(false);
  };

  // Load profile from Firestore
  const loadUserProfile = async (firebaseUser) => {
    const userDocRef = doc(db, "User", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    const data = userDoc.data() || {};

    const role = normalizeRole(data.Role || "pending");
    const company = data.Company || "";

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name:
        firebaseUser.displayName ||
        firebaseUser.email?.split("@")[0] ||
        "User",
      role,
      company,
    };
  };

  // Keep user in sync with Firebase auth session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      (async () => {
        setLoading(true);
        try {
          if (!firebaseUser) {
            setUser(null);
            return;
          }

          const profile = await loadUserProfile(firebaseUser);

          // If pending users are not allowed to remain signed in:
          if (profile.role === "pending") {
            await signOut(auth);
            setUser(null);
            return;
          }

          setUser(profile);
        } catch (error) {
          console.error("Error loading user profile:", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      })();
    });

    return () => unsubscribe();
  }, []);

  // LOGIN (auth + profile fetch + status validation)
  const login = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await loadUserProfile(cred.user);

      if (profile.role === "pending") {
        await signOut(auth);
        setUser(null);
        const err = new Error("Account pending approval");
        err.code = "ACCOUNT_PENDING";
        throw err;
      }

      setUser(profile);
      return profile.role;
    } catch (err) {
      const c = err?.code;

      // Firebase invalid credential codes vary by SDK/version
      if (
        c === "auth/invalid-credential" ||
        c === "auth/invalid-login-credentials" ||
        c === "auth/wrong-password" ||
        c === "auth/user-not-found"
      ) {
        const e = new Error("Invalid email or password");
        e.code = "INVALID_CREDENTIALS";
        throw e;
      }

      if (c === "auth/invalid-email") {
        const e = new Error("Invalid email format");
        e.code = "INVALID_EMAIL";
        throw e;
      }

      if (err?.code === "ACCOUNT_PENDING") throw err;

      console.error("Login Error:", err);
      const e = new Error("Login failed");
      e.code = "LOGIN_FAILED";
      throw e;
    }
  };

  // SIGNUP
  const signup = async (email, password, name, organization) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "User", cred.user.uid), {
        Name: name,
        email,
        Company: organization,
        Role: "pending",
        createdAt: serverTimestamp(),
      });

      // Signup auto-logs in; if you block pending users, sign out immediately
      await signOut(auth);
      setUser(null);

      return true;
    } catch (err) {
      console.error("Signup Error:", err);

      const e = new Error("Signup failed. Please try again.");
      e.code = "SIGNUP_FAILED";

      if (err?.code === "auth/email-already-in-use") {
        e.code = "EMAIL_IN_USE";
        e.message = "This email is already registered.";
      } else if (err?.code === "auth/invalid-email") {
        e.code = "INVALID_EMAIL";
        e.message = "Invalid email format.";
      } else if (err?.code === "auth/weak-password") {
        e.code = "WEAK_PASSWORD";
        e.message = "Password is too weak (min 6 characters).";
      }

      throw e;
    }
  };

  // LOGOUT
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
