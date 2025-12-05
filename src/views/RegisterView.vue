<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useAuthStore } from '../stores/auth'

const nombre = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const onSubmit = async () => {
  loading.value = true
  try {
    await authStore.register(email.value, password.value, nombre.value)

    toast.add({
      severity: 'success',
      summary: 'Registro correcto',
      detail: 'Tu cuenta ha sido creada',
      life: 3000,
    })

    router.push('/contactos')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error al registrarse',
      detail: error?.message || 'No se pudo crear la cuenta',
      life: 4000,
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="auth-panel">
    <h2>Registro</h2>

    <form class="auth-form" @submit.prevent="onSubmit">
      <div class="campo">
        <label for="nombre">Nombre</label>
        <InputText id="nombre" v-model="nombre" placeholder="Tu nombre" />
      </div>

      <div class="campo">
        <label for="email">Email</label>
        <InputText
          id="email"
          v-model="email"
          type="email"
          placeholder="correo@ejemplo.com"
        />
      </div>

      <div class="campo">
        <label for="password">Contraseña</label>
        <Password
          id="password"
          v-model="password"
          toggleMask
          :feedback="false"
          placeholder="Elige una contraseña"
        />
      </div>

      <Button
        type="submit"
        label="Registrarse"
        :loading="loading"
      />
    </form>

    <p class="muted">
      ¿Ya tienes cuenta?
      <RouterLink to="/login">Inicia sesión</RouterLink>
    </p>
  </section>
</template>

<style scoped>
.auth-panel {
  max-width: 400px;
  margin: 40px auto;
  padding: 24px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
}

.auth-form {
  display: grid;
  gap: 12px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

label {
  font-weight: 600;
}

.muted {
  margin-top: 12px;
  color: #6b7280;
}
</style>
