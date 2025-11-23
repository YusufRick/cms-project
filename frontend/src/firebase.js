// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// API keys and config object
const firebaseConfig = {
  apiKey: "AIzaSyCIIB1JFyTdo_XzBV0WFEFJacuybXza5cc",
  authDomain: "complaint-management-ad4cf.firebaseapp.com",
  projectId: "complaint-management-ad4cf",
  storageBucket: "complaint-management-ad4cf.firebasestorage.app",
  messagingSenderId: "734552933644",
  appId: "1:734552933644:web:c64ba1fead4c1f2c317529",
  measurementId: "G-PMWVYVZ3K0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase Auth to your app
export const auth = getAuth(app);
