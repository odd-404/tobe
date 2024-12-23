import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCeuW4TN7TpDpSNrno9FMfxh3RdrYLjm6o",
  authDomain: "tobe-odd.firebaseapp.com",
  projectId: "tobe-odd",
  storageBucket: "tobe-odd.firebasestorage.app",
  messagingSenderId: "264520250425",
  appId: "1:264520250425:web:888f22708fd987135989e8",
  measurementId: "G-XJKZLKD1KJ"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
