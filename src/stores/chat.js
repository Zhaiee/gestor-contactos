// src/stores/chat.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  limit,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuthStore } from './auth'

// Crear ID de conversación consistente entre dos usuarios
const crearIdConversacion = (uid1, uid2) => {
  const ids = [uid1, uid2].sort()
  return `${ids[0]}_${ids[1]}`
}

export const useChatStore = defineStore('chat', () => {
  const mensajes = ref([])
  const cargando = ref(false)
  const otroUsuario = ref(null)
  let unsubscribe = null

  const authStore = useAuthStore()

  const limpiarSuscripcion = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  // Cargar datos del usuario con el que se chatea
  const cargarOtroUsuario = async (otroUid) => {
    try {
      const docSnap = await getDoc(doc(db, 'users', otroUid))
      if (docSnap.exists()) {
        otroUsuario.value = {
          uid: docSnap.id,
          ...docSnap.data(),
        }
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error)
    }
  }

  // Iniciar la suscripción a mensajes de una conversación
  const iniciarChat = (otroUid) => {
    limpiarSuscripcion()
    mensajes.value = []
    cargando.value = true

    const user = authStore.user
    if (!user) {
      cargando.value = false
      return
    }

    // Cargar info del otro usuario
    cargarOtroUsuario(otroUid)

    const conversacionId = crearIdConversacion(user.uid, otroUid)

    const q = query(
      collection(db, 'mensajes'),
      where('conversacionId', '==', conversacionId),
      orderBy('createdAt', 'asc'),
      limit(100)
    )

    unsubscribe = onSnapshot(
      q,
      snapshot => {
        mensajes.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        cargando.value = false
      },
      err => {
        console.error('Error al escuchar mensajes:', err)
        cargando.value = false
      }
    )
  }

  // Enviar un mensaje
  const enviarMensaje = async (otroUid, contenido) => {
    const user = authStore.user
    if (!user || !contenido.trim()) {
      throw new Error('Mensaje vacío o usuario no autenticado')
    }

    const conversacionId = crearIdConversacion(user.uid, otroUid)

    try {
      await addDoc(collection(db, 'mensajes'), {
        conversacionId,
        remitenteUid: user.uid,
        remitente: user.displayName || user.email,
        contenido: contenido.trim(),
        createdAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      throw error
    }
  }

  const totalMensajes = computed(() => mensajes.value.length)

  const cerrarChat = () => {
    limpiarSuscripcion()
    mensajes.value = []
    otroUsuario.value = null
  }

  return {
    mensajes,
    cargando,
    otroUsuario,
    iniciarChat,
    enviarMensaje,
    cerrarChat,
    totalMensajes,
  }
})
