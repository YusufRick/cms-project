// src/context/authContext.js
import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth, db } from "../firebase";
import {
  serverTimestamp,
  setDoc,
  getDoc,
  doc,
} from "firebase/firestore";

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

 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        (async () => {
          try {
            const userDocRef = doc(db, "User", firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            const data = userDoc.data() || {};
            const role = (data.Role || "pending").toLowerCase();

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name:
                firebaseUser.displayName ||
                firebaseUser.email?.split("@")[0] ||
                "User",
              role,
              
              
            });
          } catch (error) {
            setUser(null);
          }
          setLoading(false);
        })();
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // LOGIN + RBAC
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    // get role from Firestore
    const userDoc = await getDoc(doc(db, "User", cred.user.uid));
    const data = userDoc.data() || {};
    const getemail = userDoc.data()?.email || "";
    const role = data.Role || "pending";
    console.log("🔥 Fetched Role from Firestore:", role);
    console.log("🔥 Fetched Role from Firestore:", getemail);

    setUser((prev) => ({
      uid: cred.user.uid,
      email: cred.user.email,
      name:
        prev?.name ||
        cred.user.displayName ||
        cred.user.email?.split("@")[0] ||
        "User",
      role,
      
    }));

    return role;
  };

  // SIGNUP
  const signup = async (email, password, name, organization) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // create user doc with ID == UID
      await setDoc(doc(db, "User", cred.user.uid), {
        Name: name,
        email,
        Company: organization,
        Role: "pending",
        createdAt: serverTimestamp(),
      });

      return cred.user;
    } catch (err) {
      console.error("Signup Error:", err);

      let message = "Signup failed. Please try again.";

      if (err.code === "auth/email-already-in-use") {
        message = "This email is already registered.";
      } else if (err.code === "auth/invalid-email") {
        message = "Invalid email format.";
      } else if (err.code === "auth/weak-password") {
        message = "Password must be stronger.";
      }

      throw new Error(message);
    }
  };

  // LOGOUT
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
