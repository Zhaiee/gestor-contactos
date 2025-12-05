// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

// Store de autenticación: gestiona el usuario actual y login/registro/logout
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)       // Datos básicos del usuario logueado
  const loading = ref(true)    // Indica si estamos cargando el estado inicial

  const setUser = (firebaseUser) => {
    if (!firebaseUser) {
      user.value = null
    } else {
      user.value = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
      }
    }
  }

  // Se llama una sola vez al iniciar la app.
  // Escucha cambios de sesión (login, logout, recarga…)
  const initAuthListener = () => {
    onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      loading.value = false
    })
  }

  // REGISTRO de usuario (email + password + nombre)
  const register = async (email, password, displayName) => {
    // Crear usuario en Firebase Auth
    const cred = await createUserWithEmailAndPassword(auth, email, password)

    // Actualizar el nombre visible del usuario en Auth
    await updateProfile(cred.user, { displayName })

    // Guardar datos básicos en la colección "users" de Firestore
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName,
      createdAt: serverTimestamp(),
    })

    // Actualizar el estado local
    setUser(cred.user)
  }

  // LOGIN
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    setUser(cred.user)
  }

  // LOGOUT
  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  return {
    user,
    loading,
    initAuthListener,
    register,
    login,
    logout,
  }
})
