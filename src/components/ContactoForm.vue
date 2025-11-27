<script setup>
import { computed, reactive, ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'

const props = defineProps({
  modelo: {
    type: Object,
    default: () => ({
      nombre: '',
      email: '',
      telefono: '',
      empresa: '',
      favorito: false,
      estado: 'Activo',
    }),
  },
  submitLabel: {
    type: String,
    default: 'Guardar',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

const form = reactive({ ...props.modelo })

watch(
  () => props.modelo,
  (nuevo) => {
    Object.assign(form, {
      nombre: '',
      email: '',
      telefono: '',
      empresa: '',
      favorito: false,
      estado: 'Activo',
      ...(nuevo || {}),
    })
  },
  { deep: true }
)

const submitted = ref(false)

const errores = computed(() => ({
  nombre: form.nombre.trim() ? '' : 'El nombre es obligatorio',
  email: form.email.trim() ? '' : 'El email es obligatorio',
}))

const esValido = computed(
  () => !errores.value.nombre && !errores.value.email
)

const onSubmit = () => {
  submitted.value = true
  if (!esValido.value) return
  emit('submit', { ...form })
}
</script>

<template>
  <form class="formulario-contacto" @submit.prevent="onSubmit">
    <div class="campo">
      <label for="nombre">Nombre</label>
      <InputText
        id="nombre"
        v-model="form.nombre"
        placeholder="Nombre completo"
        aria-describedby="nombre-ayuda"
      />
      <small
        v-if="submitted && errores.nombre"
        id="nombre-ayuda"
        class="p-error"
      >
        {{ errores.nombre }}
      </small>
    </div>

    <div class="campo">
      <label for="email">Email</label>
      <InputText
        id="email"
        v-model="form.email"
        type="email"
        placeholder="correo@ejemplo.com"
        aria-describedby="email-ayuda"
      />
      <small
        v-if="submitted && errores.email"
        id="email-ayuda"
        class="p-error"
      >
        {{ errores.email }}
      </small>
    </div>

    <div class="campo">
      <label for="telefono">Telefono</label>
      <InputText
        id="telefono"
        v-model="form.telefono"
        placeholder="600000000"
      />
    </div>

    <div class="campo">
      <label for="empresa">Empresa</label>
      <InputText
        id="empresa"
        v-model="form.empresa"
        placeholder="Nombre de la empresa"
      />
    </div>

    <div class="campo">
      <label for="estado">Estado</label>
      <Dropdown
        id="estado"
        v-model="form.estado"
        :options="[
          { label: 'Activo', value: 'Activo' },
          { label: 'Inactivo', value: 'Inactivo' },
        ]"
        option-label="label"
        option-value="value"
        placeholder="Selecciona estado"
      />
    </div>

    <div class="campo campo-checkbox">
      <Checkbox
        input-id="favorito"
        v-model="form.favorito"
        binary
      />
      <label for="favorito">Marcar como favorito</label>
    </div>

    <div class="acciones">
      <Button
        type="submit"
        :label="submitLabel"
        icon="pi pi-check"
        :loading="loading"
      />
      <slot name="extra-actions" />
    </div>
  </form>
</template>

<style scoped>
.formulario-contacto {
  display: grid;
  gap: 14px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-weight: 600;
  color: #111827;
}

.campo :deep(.p-inputtext),
.campo :deep(.p-dropdown) {
  width: 100%;
}

.campo-checkbox {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.acciones {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
