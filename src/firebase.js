// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8kB6nuUAHIXbtsxpRseuW_XuMvI5L7I0",
  authDomain: "appactivos-ccf1a.firebaseapp.com",
  projectId: "appactivos-ccf1a",
  storageBucket: "appactivos-ccf1a.appspot.com", // <- esta es la corrección
  messagingSenderId: "956934970631",
  appId: "1:956934970631:web:ea19576592874eca9a39a2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

