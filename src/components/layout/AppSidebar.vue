<script setup lang="ts">
import { computed } from "vue";

import AppLogo from "./AppLogo.vue";
import AppMenu from "./AppMenu.vue";

import { useLayoutStore } from "@/stores/layout.ts";

const layout = useLayoutStore();

const isMobile = computed(() => window.innerWidth < 768);
</script>

<template>
  <aside
    class="sidebar"
    :class="{
      open: layout.sidebarOpen,
      collapsed: layout.sidebarCollapsed && !isMobile,
    }"
  >
    <AppLogo
      :collapsed="layout.sidebarCollapsed && !isMobile"
    />

    <AppMenu
      :collapsed="layout.sidebarCollapsed && !isMobile"
    />
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  flex-shrink: 0;

  display: flex;
  flex-direction: column;

  gap: 28px;

  background: #1e293b;
  color: white;

  padding: 20px;

  height: 100dvh;

  position: sticky;
  top: 0;

  overflow: hidden;
  overflow-y: auto;

  transition:
    width .25s ease,
    transform .25s ease,
    padding .25s ease;
}

/* ===========================
   Desktop Collapse
=========================== */

.sidebar.collapsed {
  width: 72px;
  padding: 20px 12px;
}

/* ===========================
   Mobile
=========================== */

@media (max-width:768px) {

  .sidebar {

    position: fixed;

    left: 0;
    top: 0;
    bottom: 0;

    width: 260px;

    transform: translateX(-100%);

    z-index: 1000;

    box-shadow: 0 10px 30px rgba(0,0,0,.25);
  }

  .sidebar.open {

    transform: translateX(0);

  }

}
</style>