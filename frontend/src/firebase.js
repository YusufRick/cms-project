// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIIB1JFyTdo_XzBV0WFEFJacuybXza5cc",
  authDomain: "complaint-management-ad4cf.firebaseapp.com",
  projectId: "complaint-management-ad4cf",
  storageBucket: "complaint-management-ad4cf.appspot.com",
  messagingSenderId: "734552933644",
  appId: "1:734552933644:web:c64ba1fead4c1f2c317529",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
