<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from "vue";

import AppNavbar from "@/components/layout/AppNavbar.vue";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import AppOverlay from "@/components/layout/AppOverlay.vue";

import { useLayoutStore } from "@/stores/layout";

const layout = useLayoutStore();

const isMobile = computed(() => window.innerWidth < 768);

const handleResize = () => {
  if (!isMobile.value) {
    layout.closeSidebar();
  }
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div class="layout">
    <AppSidebar />

    <AppOverlay
      :show="layout.sidebarOpen && isMobile"
      @close="layout.closeSidebar"
    />

    <div class="main">
      <AppNavbar />

      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100dvh;
  background: #f8fafc;
}

.main {
  flex: 1;
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 24px;
}

@media (max-width: 768px) {
  .content {
    padding: 18px;
  }
}
</style>