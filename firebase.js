// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCxSbzpqLkjCF7LhxCsdg3xu530e0b_frs",
    authDomain: "kerjadekat-web.firebaseapp.com",
    projectId: "kerjadekat-web",
    storageBucket: "kerjadekat-web.firebasestorage.app",
    messagingSenderId: "99396133528",
    appId: "1:99396133528:web:7a01b8d1ffa588c50da6ed"
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
