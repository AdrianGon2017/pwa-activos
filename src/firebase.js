// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD8kB6nuUAHIXbtsxpRseuW_XuMvI5L7I0",
  authDomain: "appactivos-ccf1a.firebaseapp.com",
  projectId: "appactivos-ccf1a",
  storageBucket: "appactivos-ccf1a.firebasestorage.app",
  messagingSenderId: "956934970631",
  appId: "1:956934970631:web:ea19576592874eca9a39a2"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta la instancia de Firestore
export const db = getFirestore(app);
