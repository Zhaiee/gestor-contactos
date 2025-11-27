<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ContactoForm from '../components/ContactoForm.vue'
import { useContactosStore } from '../stores/contactos'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const store = useContactosStore()

const contacto = computed(
  () => store.contactoPorId(route.params.id).value
)

const modelo = computed(() =>
  contacto.value
    ? { ...contacto.value }
    : {
        nombre: '',
        email: '',
        telefono: '',
        empresa: '',
        favorito: false,
        estado: 'Activo',
      }
)

const guardar = (datos) => {
  const ok = store.actualizarContacto(route.params.id, datos)
  toast.add({
    severity: ok ? 'success' : 'warn',
    summary: ok ? 'Contacto actualizado' : 'Contacto no encontrado',
    detail: ok
      ? 'Contacto actualizado correctamente'
      : 'No se pudo actualizar',
    life: 3000,
  })
  router.push(
    ok ? `/contactos/${route.params.id}` : '/contactos'
  )
}

const cancelar = () =>
  router.push(
    contacto.value ? `/contactos/${route.params.id}` : '/contactos'
  )
</script>

<template>
  <section class="panel">
    <header class="panel__header">
      <div>
        <p class="muted">Editar</p>
        <h2>Contacto</h2>
      </div>
    </header>

    <div v-if="!contacto">
      <Message
        severity="error"
        :closable="false"
        class="mb-3"
      >
        Contacto no encontrado
      </Message>
      <Button
        label="Volver al listado"
        icon="pi pi-arrow-left"
        @click="cancelar"
      />
    </div>

    <ContactoForm
      v-else
      :modelo="modelo"
      submit-label="Actualizar contacto"
      @submit="guardar"
    >
      <template #extra-actions>
        <Button
          type="button"
          label="Cancelar"
          outlined
          @click="cancelar"
        />
      </template>
    </ContactoForm>
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
}

.muted {
  margin: 0;
  color: #6b7280;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.mb-3 {
  margin-bottom: 12px;
}
</style>
