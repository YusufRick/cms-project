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
import {serverTimestamp,setDoc,collection, addDoc} from "firebase/firestore";

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

  //create user
  // SIGNUP with Firebase (with error handling)
const signup = async (email, password, name, organization) => {
  try {
    // 1. Create user in Firebase Authentication
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    

    // 3. Create user document in Firestore
    await addDoc(collection(db, "User"), {
      Name: name,
      email : email,
      Company: organization,
      Role: "pending",
      createdAt: serverTimestamp(),
    });

    // 4. Update Firebase Auth profile


    return cred.user; 
  } 
  
  catch (err) {
    console.error("Signup Error:", err);

    
    let message = "Signup failed. Please try again.";

    if (err.code === "auth/email-already-in-use") {
      message = "This email is already registered.";
    } 
    else if (err.code === "auth/invalid-email") {
      message = "Invalid email format.";
    }
    else if (err.code === "auth/weak-password") {
      message = "Password must be stronger.";
    }

    throw new Error(message); 
  }
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
