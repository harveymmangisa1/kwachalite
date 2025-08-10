// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "kwachalite",
  appId: "1:470765994153:web:8222c38591986a13faa9b8",
  storageBucket: "kwachalite.firebasestorage.app",
  apiKey: "AIzaSyA5lSzpmwV8o4a14p9sxzd3jBhISj5HvIo",
  authDomain: "kwachalite.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "470765994153"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
