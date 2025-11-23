// src/context/authContext.js
import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase"; // <-- make sure this file exists

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // { uid, email, name, role, organization }
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state (handles refresh, new tab, etc.)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Optional: read extra meta (role/org) from localStorage if you want
        const storedMeta = localStorage.getItem("userMeta");
        let meta = null;
        if (storedMeta) {
          try {
            const parsed = JSON.parse(storedMeta);
            meta = parsed[firebaseUser.uid] || null;
          } catch {
            // ignore parse errors
          }
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name:
            firebaseUser.displayName ||
            (firebaseUser.email ? firebaseUser.email.split("@")[0] : "User"),
          role: meta?.role || "consumer",          // default for now
          organization: meta?.organization || "bank", // default for now
          createdAt: meta?.createdAt || null,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // LOGIN 
  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will update `user`
  };

  // SIGNUP with Firebase
  //admin will sign role

const signup = async (email, password, name, organization) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  if (name) {
    await updateProfile(cred.user, { displayName: name });
  }

  // save meta
  const existing = JSON.parse(localStorage.getItem("userMeta") || "{}");
  existing[cred.user.uid] = {
    organization,
    role: "pending",
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem("userMeta", JSON.stringify(existing));
};


  // LOGOUT with Firebase
  const logout = async () => {
    await signOut(auth);
    // we can keep userMeta in localStorage; it's keyed by uid anyway
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {/* avoid flicker while Firebase checks auth state */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
