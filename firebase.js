// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD_YOUR_API_KEY",
    authDomain: "kerja-dekat-YOUR_ID.firebaseapp.com",
    projectId: "kerja-dekat-YOUR_ID",
    storageBucket: "kerja-dekat-YOUR_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "1:YOUR_SENDER_ID:web:YOUR_APP_ID"
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