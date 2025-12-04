<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Card from 'primevue/card'
import Message from 'primevue/message'
import { useContactosStore } from '../stores/contactos'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const store = useContactosStore()

const contacto = computed(
  () => store.contactoPorId(route.params.id).value
)

const volver = () => router.push('/contactos')
const irEditar = () =>
  router.push(`/contactos/${route.params.id}/editar`)

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
