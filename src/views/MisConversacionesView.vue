<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuthStore } from '../stores/auth'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'

const router = useRouter()
const authStore = useAuthStore()

const conversaciones = ref([])
const cargando = ref(true)
const filtro = ref('')

const usuarioActual = computed(() => authStore.user)

// Filtrar conversaciones
const conversacionesFiltradas = computed(() => {
  const term = filtro.value.trim().toLowerCase()
  if (!term) return conversaciones.value
  return conversaciones.value.filter(c =>
    c.nombreOtro?.toLowerCase().includes(term) ||
    c.emailOtro?.toLowerCase().includes(term)
  )
})

// Cargar conversaciones únicas
const cargarConversaciones = async () => {
  if (!usuarioActual.value) {
    cargando.value = false
    return
  }

  cargando.value = true

  try {
    // Obtener todos los mensajes del usuario
    const allMessages = await getDocs(
      query(collection(db, 'mensajes'), orderBy('createdAt', 'desc'))
    )
    
    const conversacionesSet = new Map()

    // Agrupar por conversación única
    allMessages.forEach(doc => {
      const data = doc.data()
      if (!data.conversacionId) return

      const ids = data.conversacionId.split('_')
      if (!ids.includes(usuarioActual.value.uid)) return

      const otroUid = ids.find(id => id !== usuarioActual.value.uid)
      
      if (!conversacionesSet.has(otroUid)) {
        conversacionesSet.set(otroUid, {
          otroUid,
          conversacionId: data.conversacionId,
          nombreOtro: data.remitenteUid === usuarioActual.value.uid ? data.to : data.remitente,
          emailOtro: '',
          ultimoMensaje: data.contenido,
          ultimoTimestamp: data.createdAt,
        })
      }
    })

    // Cargar datos del otro usuario para cada conversación
    for (const [otroUid, conv] of conversacionesSet) {
      try {
        const userDocs = await getDocs(
          query(collection(db, 'users'), where('uid', '==', otroUid))
        )
        if (!userDocs.empty) {
          const userData = userDocs.docs[0].data()
          conv.nombreOtro = userData.displayName || userData.email
          conv.emailOtro = userData.email
        }
      } catch (e) {
        console.error('Error cargando usuario:', e)
      }
    }

    conversaciones.value = Array.from(conversacionesSet.values()).sort((a, b) => {
      const timeA = a.ultimoTimestamp?.seconds || 0
      const timeB = b.ultimoTimestamp?.seconds || 0
      return timeB - timeA
    })
  } catch (error) {
    console.error('Error al cargar conversaciones:', error)
  } finally {
    cargando.value = false
  }
}

// Formatear timestamp
const formatearHora = (timestamp) => {
  if (!timestamp || !timestamp.seconds) return ''
  const date = new Date(timestamp.seconds * 1000)
  const hoy = new Date()
  
  if (date.toDateString() === hoy.toDateString()) {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
  }
}

// Truncar mensaje
const truncarMensaje = (text, length = 50) => {
  if (!text) return '(sin mensaje)'
  return text.length > length ? text.substring(0, length) + '...' : text
}

// Abrir chat
const abrirConversacion = (otroUid) => {
  router.push(`/chat/${otroUid}`)
}

onMounted(() => {
  cargarConversaciones()
})
</script>

<template>
  <section class="panel">
    <header class="panel__header">
      <div>
        <p class="muted">Mensajería</p>
        <h2>Mis Conversaciones</h2>
      </div>
    </header>

    <div class="toolbar">
      <div class="search-wrapper">
        <i class="pi pi-search search-icon" />
        <InputText
          v-model="filtro"
          placeholder="Buscar conversaciones..."
          class="search-input"
        />
      </div>
    </div>

    <div v-if="cargando" class="loading">
      Cargando conversaciones...
    </div>

    <Message
      v-else-if="conversaciones.length === 0"
      severity="info"
      :closable="false"
    >
      No hay conversaciones aún.
    </Message>

    <div v-else class="conversaciones-list">
      <div
        v-for="conv in conversacionesFiltradas"
        :key="conv.otroUid"
        class="conversacion-item"
        @click="abrirConversacion(conv.otroUid)"
      >
        <div class="conversacion-header">
          <div class="conversacion-info">
            <h3 class="conversacion-nombre">{{ conv.nombreOtro }}</h3>
            <p class="conversacion-email">{{ conv.emailOtro }}</p>
          </div>
          <span class="conversacion-hora">{{ formatearHora(conv.ultimoTimestamp) }}</span>
        </div>
        <p class="conversacion-ultimo-mensaje">{{ truncarMensaje(conv.ultimoMensaje) }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
  padding: 18px;
  border: 1px solid #e5e7eb;
}

.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 6px 4px 14px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 14px;
}

.muted {
  margin: 0;
  color: #6b7280;
  font-weight: 600;
  letter-spacing: 0.2px;
}

h2 {
  margin: 6px 0 0 0;
}

.toolbar {
  margin-bottom: 16px;
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-icon {
  font-size: 1.1rem;
  color: #6b7280;
}

.search-input {
  width: 260px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #6b7280;
}

.conversaciones-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.conversacion-item {
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.conversacion-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.conversacion-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.conversacion-info {
  flex: 1;
}

.conversacion-nombre {
  margin: 0 0 2px 0;
  color: #111827;
  font-weight: 600;
  font-size: 0.95rem;
}

.conversacion-email {
  margin: 0;
  color: #6b7280;
  font-size: 0.85rem;
}

.conversacion-hora {
  color: #9ca3af;
  font-size: 0.85rem;
  white-space: nowrap;
}

.conversacion-ultimo-mensaje {
  margin: 6px 0 0 0;
  color: #6b7280;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
