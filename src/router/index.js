import { createRouter, createWebHistory } from 'vue-router'

import ContactosLista from '../views/ContactosLista.vue'
import ContactoNuevo from '../views/ContactoNuevo.vue'
import ContactoDetalle from '../views/ContactoDetalle.vue'
import ContactoEditar from '../views/ContactoEditar.vue'

const routes = [
  { path: '/', redirect: '/contactos' },
  {
    path: '/contactos',
    name: 'contactos',
    component: ContactosLista,
  },
  {
    path: '/contactos/nuevo',
    name: 'contacto-nuevo',
    component: ContactoNuevo,
  },
  {
    path: '/contactos/:id',
    name: 'contacto-detalle',
    component: ContactoDetalle,
    props: true,
  },
  {
    path: '/contactos/:id/editar',
    name: 'contacto-editar',
    component: ContactoEditar,
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
