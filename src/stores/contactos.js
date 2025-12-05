// src/stores/contactos.js
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuthStore } from './auth'

const baseContacto = () => ({
  nombre: '',
  email: '',
  telefono: '',
  empresa: '',
  favorito: false,
  estado: 'Activo',
  userId: '',
  creadoEn: null,
})

export const useContactosStore = defineStore('contactos', () => {
  const contactos = ref([])
  const cargando = ref(false)
  let unsubscribe = null

  const authStore = useAuthStore()

  const limpiarSuscripcion = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  const initContactos = () => {
    limpiarSuscripcion()
    contactos.value = []

    const user = authStore.user
    if (!user) return

    cargando.value = true

    const q = query(
      collection(db, 'contactos'),
      where('userId', '==', user.uid),
      orderBy('nombre')
    )

    unsubscribe = onSnapshot(
      q,
      snapshot => {
        contactos.value = snapshot.docs.map(d => ({
          id: d.id,      // 👈 id de Firestore (string)
          ...d.data(),
        }))
        cargando.value = false
      },
      err => {
        console.error('Error al escuchar contactos:', err)
        cargando.value = false
      }
    )
  }

  // Cuando cambie el usuario (login/logout), recargamos contactos
  watch(
    () => authStore.user,
    () => {
      initContactos()
    },
    { immediate: true }
  )

  const crearContacto = async (contacto) => {
    const user = authStore.user
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const nuevo = {
      ...baseContacto(),
      ...contacto,
      userId: user.uid,
      creadoEn: serverTimestamp(),
    }

    const refDoc = await addDoc(collection(db, 'contactos'), nuevo)
    // El onSnapshot actualizará contactos.value automáticamente
    return refDoc.id
  }

  const actualizarContacto = async (id, datosActualizados) => {
    try {
      await updateDoc(doc(db, 'contactos', id), {
        ...datosActualizados,
      })
      return true
    } catch (e) {
      console.error('Error al actualizar contacto', e)
      return false
    }
  }

  const eliminarContacto = async (id) => {
    try {
      await deleteDoc(doc(db, 'contactos', id))
      return true
    } catch (e) {
      console.error('Error al eliminar contacto', e)
      return false
    }
  }

  const toggleFavorito = async (id) => {
    const contacto = contactos.value.find(c => c.id === id)
    if (!contacto) return false

    const nuevoValor = !contacto.favorito
    try {
      await updateDoc(doc(db, 'contactos', id), { favorito: nuevoValor })
      return true
    } catch (e) {
      console.error('Error al marcar favorito', e)
      return false
    }
  }

  const totalContactos = computed(() => contactos.value.length)
  const totalFavoritos = computed(
    () => contactos.value.filter(c => c.favorito).length
  )
  const contactosActivos = computed(
    () => contactos.value.filter(c => c.estado === 'Activo')
  )

  const contactoPorId = (id) =>
    computed(() => contactos.value.find(c => c.id === id)) // 👈 id string

  return {
    contactos,
    cargando,
    initContactos,
    crearContacto,
    actualizarContacto,
    eliminarContacto,
    toggleFavorito,
    totalContactos,
    totalFavoritos,
    contactosActivos,
    contactoPorId,
  }
})
