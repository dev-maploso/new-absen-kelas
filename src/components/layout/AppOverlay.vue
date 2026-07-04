<script setup lang="ts">
defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();
</script>

<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="overlay"
      @click="emit('close')"
    />
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;

  background: rgba(0,0,0,.45);

  z-index: 999;
}

.fade-enter-active,
.fade-leave-active {
  transition: .25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>