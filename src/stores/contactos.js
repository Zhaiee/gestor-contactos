import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const baseContacto = () => ({
  nombre: '',
  email: '',
  telefono: '',
  empresa: '',
  favorito: false,
  estado: 'Activo',
})

export const useContactosStore = defineStore('contactos', () => {
  const contactos = ref([
    {
      id: 1,
      nombre: 'Juan Perez',
      email: 'juan@example.com',
      telefono: '600000000',
      empresa: 'Empresa A',
      favorito: false,
      estado: 'Activo',
    },
    {
      id: 2,
      nombre: 'Ana Lopez',
      email: 'ana@example.com',
      telefono: '611111111',
      empresa: 'Empresa B',
      favorito: true,
      estado: 'Inactivo',
    },
  ])

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
  const totalFavoritos = computed(
    () => contactos.value.filter(c => c.favorito).length
  )
  const contactosActivos = computed(
    () => contactos.value.filter(c => c.estado === 'Activo')
  )

  const contactoPorId = (id) =>
    computed(() => contactos.value.find(c => c.id === Number(id)))

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
