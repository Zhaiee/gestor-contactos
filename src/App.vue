<!--
  Layout principal de la app:
  - Encabezado con marca y navegación hacia la lista y creación de contactos.
  - Zona principal renderizada por el router.
  - Servicios globales de PrimeVue (toasts y diálogos de confirmación).
-->
<script setup>
// Componentes de navegación del router y servicios de PrimeVue usados a nivel global.
import { RouterLink, RouterView } from 'vue-router'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
</script>

<template>
  <div class="app-shell">
    <!-- Encabezado con marca y enlaces de navegación -->
    <header class="app-header">
      <div class="brand">
        <span class="dot" />
        <h1>Gestor de Contactos</h1>
      </div>
      <nav class="app-nav">
        <RouterLink to="/contactos" class="nav-link">Contactos</RouterLink>
        <RouterLink to="/contactos/nuevo" class="nav-link">Nuevo contacto</RouterLink>
      </nav>
    </header>

    <!-- Zona donde el router inserta la vista activa -->
    <main class="app-main">
      <RouterView />
    </main>

    <!-- Servicios globales para notificaciones y diálogos -->
    <Toast />
    <ConfirmDialog />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: radial-gradient(circle at 10% 20%, #f5f8ff 0, #f6f7fb 35%, #eef1f8 100%);
  color: #1f2933;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #dfe3ea;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(6px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand h1 {
  font-size: 20px;
  margin: 0;
  letter-spacing: 0.3px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, #6366f1, #10b981);
  box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.12);
}

.app-nav {
  display: flex;
  gap: 12px;
}

.nav-link {
  padding: 8px 14px;
  border-radius: 10px;
  color: #374151;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: #eef2ff;
  color: #4f46e5;
}

.app-main {
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .app-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .app-nav {
    width: 100%;
  }
}
</style>
