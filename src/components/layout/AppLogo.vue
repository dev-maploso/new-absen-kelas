<script setup lang="ts">
defineProps<{
  collapsed: boolean;
}>();
</script>

<template>
  <div
    class="app-logo"
    :class="{ collapsed }"
  >
    <div class="logo-icon">
      WK
    </div>

    <Transition name="fade">
      <div
        v-if="!collapsed"
        class="logo-text"
      >
        <h2>Absensi</h2>
        <small>Wali Kelas</small>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.app-logo {
  display: flex;
  align-items: center;
  gap: 14px;

  min-height: 52px;

  transition: all .25s ease;
}

.app-logo.collapsed {
  justify-content: center;
}

.logo-icon {
  width: 46px;
  height: 46px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  background: linear-gradient(
    135deg,
    #3b82f6,
    #2563eb
  );

  color: white;

  font-weight: 700;
  font-size: 16px;

  box-shadow: 0 6px 18px rgba(37, 99, 235, .35);
}

.logo-text {
  overflow: hidden;
}

.logo-text h2 {
  margin: 0;

  font-size: 18px;
  font-weight: 700;

  color: white;

  white-space: nowrap;
}

.logo-text small {
  display: block;

  margin-top: 2px;

  color: rgba(255,255,255,.65);

  font-size: 13px;

  white-space: nowrap;
}

/* Transition */

.fade-enter-active,
.fade-leave-active {
  transition: all .2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>