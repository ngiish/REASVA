// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfMv2oOi4sU2QsonP-gZYYmoSkJCB-2CA",
  authDomain: "reasva-94dd7.firebaseapp.com",
  projectId: "reasva-94dd7",
  storageBucket: "reasva-94dd7.appspot.com",
  messagingSenderId: "297699133827",
  appId: "1:297699133827:web:2e9f061c50c7a16a738eb6",
  measurementId: "G-N8Y45B2KVP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
