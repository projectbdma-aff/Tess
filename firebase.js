// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDgiQvagZWZh8q3M0XEQCh7n0VHy9m1Vyo",
    authDomain: "kerjadekat-42fba.firebaseapp.com",
    projectId: "kerjadekat-42fba",
    storageBucket: "kerjadekat-42fba.firebasestorage.app",
    messagingSenderId: "333291959453",
    appId: "1:333291959453:web:8aff82f274ad1f9099d074"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    getDoc, 
    doc, 
    setDoc, 
    updateDoc, 
    query, 
    where, 
    onSnapshot, 
    serverTimestamp, 
    Timestamp, 
    deleteDoc 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export Firebase services
window.firebaseServices = {
    auth,
    db,
    storage,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    setDoc,
    updateDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    deleteDoc,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
};
