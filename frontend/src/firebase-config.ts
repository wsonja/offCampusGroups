import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyC2sLfB7XQHsQs0RMMBL8HG4Nh_6jakRi8",
    authDomain: "offcampusgroups-fbfea.firebaseapp.com",
    projectId: "offcampusgroups-fbfea",
    storageBucket: "offcampusgroups-fbfea.firebasestorage.app",
    messagingSenderId: "837131089838",
    appId: "1:837131089838:web:5ed795c6fa7d35d2d33a3f"
  };
  
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);