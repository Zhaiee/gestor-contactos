import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
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
  const suscripcion = ref(null)

  const initContactos = () => {
    const authStore = useAuthStore()
    const usuario = authStore.user

    if (suscripcion.value) {
      suscripcion.value()
      suscripcion.value = null
    }

    if (!usuario) {
      contactos.value = []
      cargando.value = false
      return
    }

    const consulta = query(
      collection(db, 'contactos'),
      where('userId', '==', usuario.uid),
      orderBy('nombre')
    )

    cargando.value = true
    suscripcion.value = onSnapshot(
      consulta,
      (snapshot) => {
        contactos.value = snapshot.docs.map(registro => ({
          id: registro.id,
          ...registro.data(),
        }))
        cargando.value = false
      },
      (error) => {
        console.error('Error al suscribirse a contactos', error)
        cargando.value = false
      }
    )
  }

  const crearContacto = async (contacto) => {
    const authStore = useAuthStore()
    const usuario = authStore.user
    if (!usuario) {
      throw new Error('Usuario no autenticado')
    }

    const nuevo = {
      ...baseContacto(),
      ...contacto,
      userId: usuario.uid,
      creadoEn: serverTimestamp(),
    }

    try {
      const docRef = await addDoc(collection(db, 'contactos'), nuevo)
      return docRef.id
    } catch (error) {
      console.error('Error al crear contacto', error)
      throw error
    }
  }

  const actualizarContacto = async (id, datosActualizados) => {
    try {
      await updateDoc(doc(db, 'contactos', id), { ...datosActualizados })
      return true
    } catch (error) {
      console.error('Error al actualizar contacto', error)
      return false
    }
  }

  const eliminarContacto = async (id) => {
    try {
      await deleteDoc(doc(db, 'contactos', id))
      return true
    } catch (error) {
      console.error('Error al eliminar contacto', error)
      return false
    }
  }

  const toggleFavorito = async (id) => {
    const contacto = contactos.value.find(c => c.id === id)
    if (!contacto) return false

    const favorito = !contacto.favorito
    try {
      await updateDoc(doc(db, 'contactos', id), { favorito })
      return true
    } catch (error) {
      console.error('Error al actualizar favorito', error)
      return false
    }
  }

  const totalContactos = computed(() => contactos.value.length)
  const totalFavoritos = computed(() => contactos.value.filter(c => c.favorito).length)
  const contactosActivos = computed(() => contactos.value.filter(c => c.estado === 'Activo'))
  const contactoPorId = (id) => computed(() => contactos.value.find(c => c.id === id))

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
