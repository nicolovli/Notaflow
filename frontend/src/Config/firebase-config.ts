import { initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyCSt0f5sepDxiMAL_WI291MzrAyTNGB3Nc",
  authDomain: "notaflow-18a6f.firebaseapp.com",
  projectId: "notaflow-18a6f",
  storageBucket: "notaflow-18a6f.firebasestorage.app",
  messagingSenderId: "424124222252",
  appId: "1:424124222252:web:b928657a63626afc203a89",
};

const app = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db = getFirestore(app);
