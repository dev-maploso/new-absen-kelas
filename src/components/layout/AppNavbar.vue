<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Menu } from "lucide-vue-next";

import { useAuthStore } from "@/stores/auth";
import { useLayoutStore } from "@/stores/layout";

const auth = useAuthStore();
const layout = useLayoutStore();
const route = useRoute();

const title = computed(() => {
  return (route.meta.title as string) || "Dashboard";
});

const toggleSidebar = () => {
  if (window.innerWidth < 768) {
    layout.toggleSidebar();
  } else {
    layout.toggleCollapse();
  }
};
</script>

<template>
  <header class="navbar">
    <div class="navbar-left">
      <button
        class="menu-btn"
        @click="toggleSidebar"
      >
        <Menu :size="22" />
      </button>

      <h1 class="title">
        {{ title }}
      </h1>
    </div>

    <div class="navbar-right">
      <div class="user">
        <span class="user-name">
          {{ auth.user?.name }}
        </span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  height: 64px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 24px;

  background: #fff;

  border-bottom: 1px solid #e5e7eb;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-btn {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 10px;

  background: transparent;

  cursor: pointer;

  transition: .2s;
}

.menu-btn:hover {
  background: #f1f5f9;
}

.title {
  margin: 0;

  font-size: 20px;
  font-weight: 700;

  color: #0f172a;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;

  color: #334155;
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 16px;
  }

  .title {
    font-size: 18px;
  }
}
</style>