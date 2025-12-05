<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Dialog from 'primevue/dialog'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'
import { useContactosStore } from '../stores/contactos'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const authStore = useAuthStore()
const chatStore = useChatStore()
const contactosStore = useContactosStore()

const mensajeNuevo = ref('')
const enviando = ref(false)
const messagesContainer = ref(null)
const mostrarDialogoAnadirContacto = ref(false)
const nuevoContactoData = ref({
  nombre: '',
  email: '',
  telefono: '',
  empresa: '',
})

// ID del otro usuario desde la ruta
const otroUid = computed(() => route.params.id)

// Verificar que estamos logueados
const usuarioActual = computed(() => authStore.user)

// Verificar si el otro usuario ya está en contactos (por email)
const usuarioYaEnContactos = computed(() => {
  if (!chatStore.otroUsuario) return false
  return contactosStore.contactos.some(c => c.email === chatStore.otroUsuario.email)
})

onMounted(() => {
  if (otroUid.value && usuarioActual.value) {
    chatStore.iniciarChat(otroUid.value)
  }
})

// Auto-scroll al final cuando llegan mensajes
watch(
  () => chatStore.mensajes.length,
  async () => {
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }
)

const enviarMensaje = async () => {
  if (!mensajeNuevo.value.trim()) return

  enviando.value = true
  try {
    await chatStore.enviarMensaje(otroUid.value, mensajeNuevo.value)
    mensajeNuevo.value = ''
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error?.message || 'No se pudo enviar el mensaje',
      life: 3000,
    })
  } finally {
    enviando.value = false
  }
}

const volver = () => {
  chatStore.cerrarChat()
  router.push('/contactos')
}

// Formatear timestamp a hora local
const formatearHora = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp.seconds * 1000)
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Determinar si es mensaje del usuario actual
const esMensajePropio = (remitenteUid) => remitenteUid === usuarioActual.value.uid

// Abrir diálogo para añadir contacto
const abrirAnadirContacto = () => {
  if (chatStore.otroUsuario) {
    nuevoContactoData.value = {
      nombre: chatStore.otroUsuario.displayName || '',
      email: chatStore.otroUsuario.email || '',
      telefono: '',
      empresa: '',
    }
  }
  mostrarDialogoAnadirContacto.value = true
}

// Añadir contacto
const anadirContacto = async () => {
  try {
    if (!nuevoContactoData.value.nombre.trim()) {
      toast.add({
        severity: 'warn',
        summary: 'Nombre requerido',
        detail: 'Por favor ingresa el nombre del contacto',
        life: 3000,
      })
      return
    }

    const nuevoContacto = {
      nombre: nuevoContactoData.value.nombre.trim(),
      email: nuevoContactoData.value.email || '',
      telefono: nuevoContactoData.value.telefono || '',
      empresa: nuevoContactoData.value.empresa || '',
      favorito: false,
      estado: 'Activo',
      userId: usuarioActual.value.uid,
      creadoEn: serverTimestamp(),
    }

    await addDoc(collection(db, 'contactos'), nuevoContacto)

    toast.add({
      severity: 'success',
      summary: 'Contacto añadido',
      detail: 'Contacto agregado correctamente',
      life: 3000,
    })

    mostrarDialogoAnadirContacto.value = false
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo añadir el contacto',
      life: 3000,
    })
    console.error('Error al añadir contacto:', error)
  }
}
</script>

<template>
  <section class="panel">
    <header class="panel__header">
      <div>
        <p class="muted">Chat</p>
        <h2>
          Conversación con {{ chatStore.otroUsuario?.displayName || 'Usuario' }}
        </h2>
      </div>
      <div class="header-buttons">
        <Button
          v-if="!usuarioYaEnContactos"
          label="Añadir contacto"
          icon="pi pi-plus"
          severity="success"
          @click="abrirAnadirContacto"
        />
        <Button
          label="Volver"
          icon="pi pi-arrow-left"
          outlined
          @click="volver"
        />
      </div>
    </header>

    <Message
      v-if="!chatStore.otroUsuario && !chatStore.cargando"
      severity="error"
      :closable="false"
      class="mb-3"
    >
      Usuario no encontrado
    </Message>

    <div v-else class="chat-container">
      <!-- Área de mensajes -->
      <div ref="messagesContainer" class="messages-area">
        <div v-if="chatStore.cargando" class="loading">
          Cargando conversación...
        </div>

        <div v-if="!chatStore.cargando && chatStore.totalMensajes === 0" class="no-messages">
          <p>No hay mensajes aún. ¡Inicia la conversación!</p>
        </div>

        <div
          v-for="mensaje in chatStore.mensajes"
          :key="mensaje.id"
          :class="['mensaje', esMensajePropio(mensaje.remitenteUid) ? 'propio' : 'otro']"
        >
          <div class="mensaje-contenido">
            <p class="mensaje-texto">{{ mensaje.contenido }}</p>
            <span class="mensaje-hora">{{ formatearHora(mensaje.createdAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Área de entrada -->
      <div class="input-area">
        <InputText
          v-model="mensajeNuevo"
          placeholder="Escribe un mensaje..."
          class="mensaje-input"
          @keyup.enter="enviarMensaje"
          :disabled="enviando"
        />
        <Button
          icon="pi pi-send"
          @click="enviarMensaje"
          :loading="enviando"
          :disabled="!mensajeNuevo.trim() || enviando"
        />
      </div>
    </div>

    <!-- Diálogo para añadir contacto -->
    <Dialog
      v-model:visible="mostrarDialogoAnadirContacto"
      header="Añadir Contacto"
      :modal="true"
      class="dialog-aniadir-contacto"
    >
      <div class="dialog-content">
        <div class="campo">
          <label for="nombre">Nombre *</label>
          <InputText
            id="nombre"
            v-model="nuevoContactoData.nombre"
            placeholder="Nombre del contacto"
          />
        </div>

        <div class="campo">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="nuevoContactoData.email"
            placeholder="Email"
            disabled
          />
        </div>

        <div class="campo">
          <label for="telefono">Teléfono</label>
          <InputText
            id="telefono"
            v-model="nuevoContactoData.telefono"
            placeholder="Teléfono"
          />
        </div>

        <div class="campo">
          <label for="empresa">Empresa</label>
          <InputText
            id="empresa"
            v-model="nuevoContactoData.empresa"
            placeholder="Empresa"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          icon="pi pi-times"
          outlined
          @click="mostrarDialogoAnadirContacto = false"
        />
        <Button
          label="Añadir"
          icon="pi pi-check"
          @click="anadirContacto"
        />
      </template>
    </Dialog>
  </section>
</template>

<style scoped>
.panel {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
  padding: 18px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
}

.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 4px 14px;
  border-bottom: 1px solid #e5e7eb;
}

.muted {
  margin: 0;
  color: #6b7280;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.chat-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow: hidden;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.loading,
.no-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  text-align: center;
}

.mensaje {
  display: flex;
  margin-bottom: 8px;
}

.mensaje.propio {
  justify-content: flex-end;
}

.mensaje.otro {
  justify-content: flex-start;
}

.mensaje-contenido {
  max-width: 60%;
  padding: 10px 14px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mensaje.propio .mensaje-contenido {
  background: #3b82f6;
  color: #fff;
}

.mensaje.otro .mensaje-contenido {
  background: #e5e7eb;
  color: #111827;
}

.mensaje-texto {
  margin: 0;
  word-wrap: break-word;
  word-break: break-word;
}

.mensaje-hora {
  font-size: 0.75rem;
  opacity: 0.8;
  text-align: right;
}

.input-area {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.mensaje-input {
  flex: 1;
}

.mb-3 {
  margin-bottom: 12px;
}

.header-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dialog-content {
  display: grid;
  gap: 14px;
  padding: 6px 0;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.campo label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #374151;
}

.campo :deep(.p-inputtext) {
  width: 100%;
}

@media (max-width: 640px) {
  .panel {
    height: auto;
  }

  .messages-area {
    height: 400px;
  }

  .mensaje-contenido {
    max-width: 80%;
  }

  .header-buttons {
    flex-direction: column;
    width: 100%;
  }
}
</style>
