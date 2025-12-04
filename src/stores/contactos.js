import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

// watch para depurar cambios en contactos (chat GPT)

const STORAGE_KEY = 'gestor-contactos-data' // Almacenamiento local (ChatGPT)

const baseContacto = () => ({
  nombre: '',
  email: '',
  telefono: '',
  empresa: '',
  favorito: false,
  estado: 'Activo',
})

export const useContactosStore = defineStore('contactos', () => {
  const contactos = ref([])

  // ChatGPT: Cargar contactos desde el almacenamiento local al iniciar la tienda
  const guardados = localStorage.getItem(STORAGE_KEY)

  if (guardados) {
    try {
      contactos.value = JSON.parse(guardados)
    } catch (error) {
      console.error('Error al leer contactos de localStorage: ', error)
      contactos.value = []
    }
  } else {
    contactos.value = []
  }



  const nextId = () =>
    contactos.value.length
      ? Math.max(...contactos.value.map(c => c.id)) + 1
      : 1

  const crearContacto = (contacto) => {
    const nuevo = {
      ...baseContacto(),
      ...contacto,
      id: nextId(),
      estado: contacto.estado || 'Activo',
      favorito: Boolean(contacto.favorito),
    }
    contactos.value.push(nuevo)
    return nuevo.id
  }

  const actualizarContacto = (id, datosActualizados) => {
    const index = contactos.value.findIndex(c => c.id === Number(id))
    if (index === -1) return false
    contactos.value[index] = {
      ...contactos.value[index],
      ...datosActualizados,
      id: Number(id),
    }
    return true
  }

  const eliminarContacto = (id) => {
    const index = contactos.value.findIndex(c => c.id === Number(id))
    if (index === -1) return false
    contactos.value.splice(index, 1)
    return true
  }

  const toggleFavorito = (id) => {
    const contacto = contactos.value.find(c => c.id === Number(id))
    if (!contacto) return false
    contacto.favorito = !contacto.favorito
    return true
  }



  const totalContactos = computed(() => contactos.value.length)
  const totalFavoritos = computed(() => contactos.value.filter(c => c.favorito).length)
  const contactosActivos = computed(() => contactos.value.filter(c => c.estado === 'Activo'))
  const contactoPorId = (id) => computed(() => contactos.value.find(c => c.id === Number(id)))

  // ChatGPT: Guardar cambios automáticamente en localStorage
  watch(
    contactos,
    (nuevosContactos) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosContactos))
    },
    { deep: true }
  )


  return {
    contactos,
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
