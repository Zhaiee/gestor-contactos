<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import { useContactosStore } from '../stores/contactos'

const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const store = useContactosStore()

const filtro = ref('')

const contactosFiltrados = computed(() => {
  const term = filtro.value.trim().toLowerCase()
  if (!term) return store.contactos
  return store.contactos.filter(
    c =>
      c.nombre.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
  )
})

const totalContactos = computed(() => store.totalContactos)
const totalFavoritos = computed(() => store.totalFavoritos)

const goNuevo = () => router.push('/contactos/nuevo')
const ver = (id) => router.push(`/contactos/${id}`)
const editar = (id) => router.push(`/contactos/${id}/editar`)
const toggleFavorito = (id) => store.toggleFavorito(id)

const confirmEliminar = (id) => {
  confirm.require({
    message: 'Seguro que quieres eliminar este contacto?',
    header: 'Confirmacion',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Si',
    rejectLabel: 'No',
    accept: () => {
      const eliminado = store.eliminarContacto(id)
      toast.add({
        severity: eliminado ? 'success' : 'warn',
        summary: eliminado ? 'Eliminado' : 'Aviso',
        detail: eliminado
          ? 'Contacto eliminado correctamente'
          : 'No se encontro el contacto',
        life: 3000,
      })
    },
  })
}
</script>

<template>
  <section class="panel">
    <header class="panel__header">
      <div>
        <p class="muted">Resumen</p>
        <h2>Contactos</h2>
        <div class="chips">
          <Tag
            :value="`Total: ${totalContactos}`"
            severity="info"
            rounded
          />
          <Tag
            :value="`Favoritos: ${totalFavoritos}`"
            severity="success"
            rounded
          />
        </div>
      </div>
      <Button
        label="Nuevo contacto"
        icon="pi pi-plus"
        @click="goNuevo"
      />
    </header>

    <div class="toolbar">
      <span class="p-input-icon-left">
        <i class="pi pi-search" />
        <InputText
          v-model="filtro"
          placeholder="Buscar por nombre o email"
        />
      </span>
    </div>

    <DataTable
      :value="contactosFiltrados"
      responsiveLayout="scroll"
      paginator
      :rows="8"
      :emptyMessage="'No hay contactos'"
    >
      <Column field="nombre" header="Nombre" sortable />
      <Column field="email" header="Email" />
      <Column field="telefono" header="Telefono" />
      <Column header="Estado">
        <template #body="{ data }">
          <Tag
            :value="data.estado"
            :severity="data.estado === 'Activo' ? 'success' : 'warning'"
            rounded
          />
        </template>
      </Column>
      <Column header="Favorito" style="width: 100px">
        <template #body="{ data }">
          <Button
            :icon="data.favorito ? 'pi pi-star-fill' : 'pi pi-star'"
            :severity="data.favorito ? 'warning' : 'secondary'"
            text
            rounded
            @click="toggleFavorito(data.id)"
            :aria-label="data.favorito ? 'Quitar de favoritos' : 'Marcar como favorito'"
          />
        </template>
      </Column>
      <Column header="Acciones" style="width: 170px">
        <template #body="{ data }">
          <div class="actions">
            <Button
              icon="pi pi-eye"
              text
              rounded
              @click="ver(data.id)"
              aria-label="Ver"
            />
            <Button
              icon="pi pi-pencil"
              text
              rounded
              severity="info"
              @click="editar(data.id)"
              aria-label="Editar"
            />
            <Button
              icon="pi pi-trash"
              text
              rounded
              severity="danger"
              @click="confirmEliminar(data.id)"
              aria-label="Eliminar"
            />
          </div>
        </template>
      </Column>
    </DataTable>
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

.chips {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
}

:deep(.p-inputtext) {
  width: 260px;
}

@media (max-width: 640px) {
  .panel__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  :deep(.p-inputtext) {
    width: 100%;
  }
}
</style>
