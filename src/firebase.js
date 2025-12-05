// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚠️ Usa tu configuración real de Firebase:
// (esta es la que tú ya tienes en tu proyecto)
const firebaseConfig = {
  apiKey: "AIzaSyAbKD54ue3kXdgumyJZUOFohqjtLKxL1MU",
  authDomain: "gestor-contactos-f7435.firebaseapp.com",
  projectId: "gestor-contactos-f7435",
  storageBucket: "gestor-contactos-f7435.firebasestorage.app",
  messagingSenderId: "530501135300",
  appId: "1:530501135300:web:7af7b6f96175e4c0d51291",
  measurementId: "G-JWDQ5EBGTN"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios que usará la aplicación
export const auth = getAuth(app);
export const db = getFirestore(app);
