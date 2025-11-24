// IMPORTS
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCIIB1JFyTdo_XzBV0WFEFJacuybXza5cc",
  authDomain: "complaint-management-ad4cf.firebaseapp.com",
  projectId: "complaint-management-ad4cf",
  storageBucket: "complaint-management-ad4cf.firebasestorage.app",
  messagingSenderId: "734552933644",
  appId: "1:734552933644:web:c64ba1fead4c1f2c317529",
  measurementId: "G-PMWVYVZ3K0"
};

// INIT
const app = initializeApp(firebaseConfig);

// EXPORTS
export const auth = getAuth(app);
export const db = getFirestore(app);
