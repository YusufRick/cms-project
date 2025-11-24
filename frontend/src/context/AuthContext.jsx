// src/context/authContext.js
import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { uid, email, name, role, organization }
  const [loading, setLoading] = useState(true);

  // Keep user in sync with Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name:
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "User",
          role: "pending", // admin will set actual role later
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

  // SIGNUP
  const signup = async (email, password, name, organization) => {
    // 1. create auth user
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // 2. set displayName
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }

    // 3. store meta in Firestore
    await setDoc(doc(db, "User", cred.user.uid), {
      Name: name,
      email,
      Company: organization,
      Role: "pending", // admin will approve + set final role
      createdAt: serverTimestamp(),
    });
  };

  // LOGOUT
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
