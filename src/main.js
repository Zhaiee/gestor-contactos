// Configuración inicial de la aplicación: crea la instancia de Vue,
// registra el router, el store y servicios de UI (PrimeVue, Toasts, Confirmación).
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import App from './App.vue'
import router from './router'

import 'primeicons/primeicons.css'

// Crea la instancia raíz de Vue a partir del componente App.
const app = createApp(App)

// Registra el store global (Pinia) para manejar estado compartido.
app.use(createPinia())
// Registra el router para navegación entre vistas.
app.use(router)
// Configura PrimeVue con el tema Aura para componentes UI.
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})
// Habilita el servicio de toasts (notificaciones emergentes).
app.use(ToastService)
// Habilita el servicio de diálogos de confirmación.
app.use(ConfirmationService)

// Monta la aplicación en el elemento raíz del DOM.
app.mount('#app')
