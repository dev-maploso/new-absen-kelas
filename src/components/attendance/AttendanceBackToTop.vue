<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const show = ref(false);

function onScroll() {
  show.value = window.scrollY > 300;
}

function backToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  // Fokus ke search setelah scroll selesai
  setTimeout(() => {
    const input = document.getElementById("attendance-search");
    input?.focus();
  }, 500);
}

onMounted(() => {
  window.addEventListener("scroll", onScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <Transition
    enter-active-class="transition duration-300"
    leave-active-class="transition duration-200"
    enter-from-class="opacity-0 translate-y-3"
    leave-to-class="opacity-0 translate-y-3"
  >
    <button
      v-if="show"
      @click="backToTop"
      class="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl transition hover:scale-110 hover:bg-indigo-700 active:scale-95"
    >
      ⬆️
    </button>
  </Transition>
</template>