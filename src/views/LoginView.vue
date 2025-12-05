<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const loading = ref(false)

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const onSubmit = async () => {
  loading.value = true
  try {
    await authStore.login(email.value, password.value)

    toast.add({
      severity: 'success',
      summary: 'Login correcto',
      detail: 'Has iniciado sesión correctamente',
      life: 3000,
    })

    router.push('/contactos')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error al iniciar sesión',
      detail: error?.message || 'Credenciales incorrectas',
      life: 4000,
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="auth-panel">
    <h2>Iniciar sesión</h2>

    <form class="auth-form" @submit.prevent="onSubmit">
      <div class="campo">
        <label for="email">Email</label>
        <InputText
          id="email"
          v-model="email"
          type="email"
          placeholder="correo@ejemplo.com"
          required
        />
      </div>

      <div class="campo">
        <label for="password">Contraseña</label>
        <Password
          id="password"
          v-model="password"
          toggleMask
          :feedback="false"
          placeholder="Introduce tu contraseña"
          required
        />
      </div>

      <Button
        type="submit"
        label="Entrar"
        :loading="loading"
        class="boton"
      />
    </form>

    <p class="muted">
      ¿No tienes cuenta?
      <RouterLink to="/registro">Regístrate aquí</RouterLink>
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
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-form {
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
  color: #1f2937;
}

.boton {
  width: 100%;
}

.muted {
  margin-top: 8px;
  text-align: center;
  color: #6b7280;
}

.muted a {
  font-weight: 600;
  color: #4f46e5;
  text-decoration: none;
}

.muted a:hover {
  text-decoration: underline;
}
</style>
