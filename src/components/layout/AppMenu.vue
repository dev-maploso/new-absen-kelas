<script setup lang="ts">
import {
  LayoutDashboard,
  ClipboardCheck,
  User,
  LogOut,
} from "lucide-vue-next";

import { RouterLink, useRoute, useRouter } from "vue-router";

import { useAuthStore } from "@/stores/auth";

defineProps<{
  collapsed: boolean;
}>();

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const menus = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    to: "/dashboard",
  },
  {
    title: "Absensi",
    icon: ClipboardCheck,
    to: "/attendance",
  },
];

const bottomMenus = [
  {
    title: "Profil",
    icon: User,
    to: "/profile",
  },
];

const logout = async () => {
  await auth.logout();
  await router.replace({ name: "login" });
};
</script>

<template>
  <nav class="menu">
    <div class="menu-top">
      <RouterLink
        v-for="menu in menus"
        :key="menu.to"
        :to="menu.to"
        class="menu-item"
        :class="{
          active: route.path.startsWith(menu.to),
          collapsed,
        }"
        :title="collapsed ? menu.title : ''"
      >
        <component
          :is="menu.icon"
          :size="20"
          class="icon"
        />

        <span
          v-if="!collapsed"
          class="label"
        >
          {{ menu.title }}
        </span>
      </RouterLink>
    </div>

    <div class="menu-bottom">
      <RouterLink
        v-for="menu in bottomMenus"
        :key="menu.to"
        :to="menu.to"
        class="menu-item"
        :class="{
          active: route.path.startsWith(menu.to),
          collapsed,
        }"
        :title="collapsed ? menu.title : ''"
      >
        <component
          :is="menu.icon"
          :size="20"
          class="icon"
        />

        <span
          v-if="!collapsed"
          class="label"
        >
          {{ menu.title }}
        </span>
      </RouterLink>

      <button
        class="menu-item logout"
        :class="{ collapsed }"
        :title="collapsed ? 'Logout' : ''"
        @click="logout"
      >
        <LogOut
          :size="20"
          class="icon"
        />

        <span
          v-if="!collapsed"
          class="label"
        >
          Logout
        </span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.menu {
  flex: 1;

  display: flex;
  flex-direction: column;
}

.menu-top {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.menu-bottom {
  margin-top: auto;

  display: flex;
  flex-direction: column;
  gap: 6px;

  padding-top: 20px;

  border-top: 1px solid rgba(255, 255, 255, .08);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;

  height: 46px;

  padding: 0 14px;

  border-radius: 12px;

  color: #cbd5e1;

  text-decoration: none;

  transition: all .2s ease;

  cursor: pointer;

  border: none;

  background: transparent;

  font: inherit;

  width: 100%;
}

.menu-item:hover {
  background: rgba(255,255,255,.08);

  color: white;
}

.menu-item.active {
  background: #2563eb;

  color: white;

  font-weight: 600;
}

.menu-item.collapsed {
  justify-content: center;

  padding: 0;
}

.icon {
  flex-shrink: 0;
}

.label {
  white-space: nowrap;
}

.logout:hover {
  background: rgba(239,68,68,.15);

  color: #fca5a5;
}
</style>