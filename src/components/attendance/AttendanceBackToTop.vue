<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { ArrowUp } from "lucide-vue-next";

const show = ref(false);

function onScroll() {
  show.value = window.scrollY > 300;
}

function backToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  setTimeout(() => {
    document.getElementById("attendance-search")?.focus();
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
    enter-from-class="opacity-0 translate-y-4 scale-90"
    leave-to-class="opacity-0 translate-y-4 scale-90"
  >
    <button
      v-if="show"
      @click="backToTop"
      class="fixed bottom-32 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl ring-4 ring-white transition-all duration-200 hover:scale-110 hover:bg-indigo-700 active:scale-95"
      title="Kembali ke atas"
    >
      <ArrowUp :size="24" />
    </button>
  </Transition>
</template>