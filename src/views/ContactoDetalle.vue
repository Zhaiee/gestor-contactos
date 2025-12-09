<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Card from 'primevue/card'
import Message from 'primevue/message'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useContactosStore } from '../stores/contactos'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const store = useContactosStore()

const contacto = computed(
  () => store.contactoPorId(route.params.id).value   // 👈 sin Number()
)
const usuarioRegistrado = ref(null)

const volver = () => router.push('/contactos')
const irEditar = () => router.push(`/contactos/${route.params.id}/editar`)

const toggleFavorito = () => {
  if (!contacto.value) return
  store.toggleFavorito(contacto.value.id)
  toast.add({
    severity: 'info',
    summary: contacto.value.favorito
      ? 'Marcado como favorito'
      : 'Quitado de favoritos',
    life: 2000,
  })
}

const cargarUsuarioRegistrado = async () => {
  if (!contacto.value || !contacto.value.email) {
    usuarioRegistrado.value = null
    return
  }

  try {
    console.log('🔍 Buscando usuario con email:', contacto.value.email)
    const q = query(
      collection(db, 'users'),
      where('email', '==', contacto.value.email)
    )
    const snap = await getDocs(q)
    console.log('📊 Usuarios encontrados:', snap.size)

    if (!snap.empty) {
      const docSnap = snap.docs[0]
      usuarioRegistrado.value = {
        id: docSnap.id,
        ...docSnap.data(),
      }
      console.log('✅ Usuario registrado encontrado:', usuarioRegistrado.value)
    } else {
      usuarioRegistrado.value = null
      console.log('❌ No se encontró usuario con ese email')
    }
  } catch (error) {
    console.error('Error al verificar usuario registrado', error)
    usuarioRegistrado.value = null
  }
}

const iniciarChat = () => {
  if (!usuarioRegistrado.value) return
  router.push(`/chat/${usuarioRegistrado.value.id}`)
}

const invitar = (email) => {
  const asunto = encodeURIComponent("Únete a mi agenda de contactos")
  const cuerpo = encodeURIComponent(
    "Hola,\n\nEstoy usando una aplicación para gestionar contactos y chatear fácilmente.\n" +
    "Puedes registrarte aquí:\nhttps://gestor-contactos.web.app/registro\n\n" +
    "Cuando te registres, podré escribirte directamente desde la aplicación.\n\n" +
    "¡Te espero!"
  )

  const enlace = `mailto:${email}?subject=${asunto}&body=${cuerpo}`
  window.location.href = enlace
}

watch(
  contacto,
  () => {
    cargarUsuarioRegistrado()
  },
  { immediate: true }
)
</script>

<template>
  <section class="panel">
    <header class="panel__header">
      <div>
        <p class="muted">Detalle</p>
        <h2>Contacto</h2>
      </div>
      <div class="actions">
        <Button
          label="Volver al listado"
          icon="pi pi-arrow-left"
          outlined
          @click="volver"
        />
        <Button
          label="Editar"
          icon="pi pi-pencil"
          severity="info"
          @click="irEditar"
        />
      </div>
    </header>

    <Message
      v-if="!contacto"
      severity="error"
      :closable="false"
      class="mb-3"
    >
      Contacto no encontrado
    </Message>

    <Card v-else>
      <template #title>
        <div class="card-title">
          <div>
            <h3>{{ contacto.nombre }}</h3>
            <div class="row">
              <Tag
                :value="contacto.estado"
                :severity="contacto.estado === 'Activo' ? 'success' : 'warning'"
                rounded
              />
              <Tag
                v-if="contacto.favorito"
                value="Favorito"
                severity="info"
                rounded
                class="ml-2"
              />
            </div>
          </div>
          <Button
            :label="contacto.favorito ? 'Quitar favorito' : 'Marcar favorito'"
            :icon="contacto.favorito ? 'pi pi-star-fill' : 'pi pi-star'"
            severity="warning"
            text
            @click="toggleFavorito"
          />
        </div>
      </template>

      <template #content>
        <ul class="detalle">
          <li>
            <span class="etiqueta">Email</span>
            <span>{{ contacto.email }}</span>
          </li>
          <li>
            <span class="etiqueta">Telefono</span>
            <span>{{ contacto.telefono || '-' }}</span>
          </li>
          <li>
            <span class="etiqueta">Empresa</span>
            <span>{{ contacto.empresa || '-' }}</span>
          </li>
        </ul>

        <div class="user-section">
          <h4>Registro de usuario</h4>
          <div v-if="usuarioRegistrado" class="user-card success">
            <p class="status">Este contacto esta registrado en el sistema</p>
            <p class="name">{{ usuarioRegistrado.displayName || usuarioRegistrado.email }}</p>
            <Button
              label="Abrir chat"
              icon="pi pi-comments"
              severity="success"
              @click="iniciarChat"
            />
          </div>
          <div v-else class="user-card warn">
            <p class="status">Este contacto NO esta registrado</p>
            <p class="muted small">Puedes invitarle a crear una cuenta</p>
            <Button
              label="Invitar"
              icon="pi pi-send"
              severity="info"
              outlined
              @click="invitar(contacto.email)"
            />
          </div>
        </div>
      </template>
    </Card>
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
  gap: 12px;
  padding: 6px 4px 14px;
}

.muted {
  margin: 0;
  color: #6b7280;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 6px;
}

.detalle {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.detalle li {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
  color: #374151;
}

.etiqueta {
  min-width: 90px;
  font-weight: 600;
  color: #374151;
}

.mb-3 {
  margin-bottom: 12px;
}

.ml-2 {
  margin-left: 8px;
}

.user-section {
  margin-top: 18px;
  border-top: 1px solid #e5e7eb;
  padding-top: 14px;
  display: grid;
  gap: 10px;
}

.user-card {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  display: grid;
  gap: 6px;
}

.user-card.success {
  border-color: #c7ead3;
  background: #f1fbf5;
}

.user-card.warn {
  border-color: #e5e7eb;
  background: #f9fafb;
}

.status {
  margin: 0;
  font-weight: 700;
  color: #111827;
}

.name {
  margin: 0;
  color: #4b5563;
  font-weight: 600;
}

.small {
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .panel__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-title {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
