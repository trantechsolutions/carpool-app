// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBcR--afqQJ9lB2ZYl_ozLRMY8bR9Vyq9Q",
  authDomain: "carpool-app-d36f0.firebaseapp.com",
  projectId: "carpool-app-d36f0",
  storageBucket: "carpool-app-d36f0.firebasestorage.app",
  messagingSenderId: "626763270456",
  appId: "1:626763270456:web:d859eb9bfba021ed5559cd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services to use elsewhere in the app
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;