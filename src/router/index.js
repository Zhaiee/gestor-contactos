import { createRouter, createWebHistory } from 'vue-router'

import ContactosLista from '../views/ContactosLista.vue'
import ContactoNuevo from '../views/ContactoNuevo.vue'
import ContactoDetalle from '../views/ContactoDetalle.vue'
import ContactoEditar from '../views/ContactoEditar.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ChatView from '../views/ChatView.vue'
import MisConversacionesView from '../views/MisConversacionesView.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  // inicio → login
  { path: '/', redirect: '/login' },

  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/registro',
    name: 'registro',
    component: RegisterView,
  },

  // RUTAS PROTEGIDAS (solo con sesión iniciada)
  {
    path: '/contactos',
    name: 'contactos',
    component: ContactosLista,
    meta: { requiresAuth: true },
  },
  {
    path: '/contactos/nuevo',
    name: 'contacto-nuevo',
    component: ContactoNuevo,
    meta: { requiresAuth: true },
  },
  {
    path: '/contactos/:id',
    name: 'contacto-detalle',
    component: ContactoDetalle,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/contactos/:id/editar',
    name: 'contacto-editar',
    component: ContactoEditar,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/chat/:id',
    name: 'chat',
    component: ChatView,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/mis-conversaciones',
    name: 'mis-conversaciones',
    component: MisConversacionesView,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard global
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(r => r.meta.requiresAuth)

  // Si la ruta requiere estar logueado y no hay usuario → al login
  if (requiresAuth && !authStore.user) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  }
  // Si ya estoy logueado y voy a /login o /registro → a contactos
  else if ((to.name === 'login' || to.name === 'registro') && authStore.user) {
    next({ name: 'contactos' })
  }
  else {
    next()
  }
})

export default router
