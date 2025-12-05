// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import App from './App.vue'
import router from './router'

import 'primeicons/primeicons.css'

import { useAuthStore } from './stores/auth'

// Crea la instancia raíz de Vue
const app = createApp(App)

// Crea la instancia de Pinia (store global)
const pinia = createPinia()

// Registra plugins en la app
app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})
app.use(ToastService)
app.use(ConfirmationService)

// IMPORTANTE: iniciar el listener de autenticación ANTES de montar la app
const authStore = useAuthStore()
authStore.initAuthListener()

// Monta la aplicación en el div #app
app.mount('#app')
