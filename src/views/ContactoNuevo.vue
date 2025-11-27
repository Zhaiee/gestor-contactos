<script setup>
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import ContactoForm from '../components/ContactoForm.vue'
import { useContactosStore } from '../stores/contactos'

const router = useRouter()
const toast = useToast()
const store = useContactosStore()

const contactoInicial = {
  nombre: '',
  email: '',
  telefono: '',
  empresa: '',
  favorito: false,
  estado: 'Activo',
}

const guardar = (datos) => {
  const id = store.crearContacto(datos)
  toast.add({
    severity: 'success',
    summary: 'Contacto creado',
    detail: 'Contacto creado correctamente',
    life: 3000,
  })
  router.push(`/contactos/${id}`)
}

const cancelar = () => router.push('/contactos')
</script>

<template>
  <section class="panel">
    <header class="panel__header">
      <div>
        <p class="muted">Crear</p>
        <h2>Nuevo contacto</h2>
      </div>
    </header>

    <ContactoForm
      :modelo="contactoInicial"
      submit-label="Crear contacto"
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
</style>
