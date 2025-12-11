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
  updateDoc,
  collectionGroup,
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
  const conversaciones = ref([])
  let unsubscribe = null
  let unsubscribeConversaciones = null

  const authStore = useAuthStore()

  const conversacionesSinLeer = computed(() => {
    return conversaciones.value.filter(c => c.sinLeer > 0).length
  })

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
  // Estructura: /chats/{chatId}/messages/{messageId}
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

    // Consultar mensajes en la subcolección /chats/{chatId}/messages
    const q = query(
      collection(db, `chats/${conversacionId}/messages`),
      orderBy('timestamp', 'asc'),
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
        
        // Marcar mensajes como leídos si son del otro usuario
        snapshot.docs.forEach(doc => {
          const data = doc.data()
          if (data.from !== user.uid && !data.read) {
            updateDoc(doc.ref, { read: true }).catch(err => 
              console.error('Error marcando como leído:', err)
            )
          }
        })
        
        // Actualizar contador de conversaciones sin leer
        cargarConversaciones()
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
      // Crear estructura de mensaje según enunciado:
      // {from, to, text, timestamp, read}
      await addDoc(collection(db, `chats/${conversacionId}/messages`), {
        from: user.uid,
        to: otroUid,
        text: contenido.trim(),
        timestamp: serverTimestamp(),
        read: false,
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

  // Cargar todas las conversaciones del usuario actual
  const cargarConversaciones = async () => {
    if (!authStore.user) return

    try {
      const allMessages = await getDocs(collectionGroup(db, 'messages'))
      const conversacionesMap = new Map()

      allMessages.forEach(doc => {
        const data = doc.data()
        if (data.from === authStore.user.uid || data.to === authStore.user.uid) {
          const otroUid = data.from === authStore.user.uid ? data.to : data.from

          if (!conversacionesMap.has(otroUid)) {
            conversacionesMap.set(otroUid, {
              otroUid,
              sinLeer: 0,
            })
          }

          const conv = conversacionesMap.get(otroUid)
          if (data.to === authStore.user.uid && !data.read) {
            conv.sinLeer++
          }
        }
      })

      conversaciones.value = Array.from(conversacionesMap.values())
    } catch (error) {
      console.error('Error al cargar conversaciones:', error)
    }
  }

  return {
    mensajes,
    cargando,
    otroUsuario,
    conversaciones,
    conversacionesSinLeer,
    iniciarChat,
    enviarMensaje,
    cerrarChat,
    totalMensajes,
    cargarConversaciones,
  }
})
