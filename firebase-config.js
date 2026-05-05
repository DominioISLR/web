import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBa9AWJ-8cVA8NaOkKjzlBqB8BwOG49AaA",
  authDomain: "logist-plani-diaria.firebaseapp.com",
  databaseURL: "https://logist-plani-diaria-default-rtdb.firebaseio.com",
  projectId: "logist-plani-diaria",
  storageBucket: "logist-plani-diaria.firebasestorage.app",
  messagingSenderId: "583963661419",
  appId: "1:583963661419:web:5e8bf15c807f8442380d2e",
  measurementId: "G-2Z6X6DH7ST"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs, query, where, orderBy, onSnapshot, deleteDoc, doc, updateDoc };