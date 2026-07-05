<script setup lang="ts">
import { computed } from "vue";
import { useAttendanceStore } from "@/stores/attendance";

const attendance = useAttendanceStore();

const stats = computed(() => attendance.statistics);

const cards = computed(() => [
  {
    title: "Total Santri",
    value: stats.value.total,
    icon: "👥",
    bg: "bg-slate-100",
  },
  {
    title: "Hadir",
    value: stats.value.hadir,
    icon: "✅",
    bg: "bg-emerald-100",
  },
  {
    title: "Izin",
    value: stats.value.izin,
    icon: "📝",
    bg: "bg-amber-100",
  },
  {
    title: "Sakit",
    value: stats.value.sakit,
    icon: "🤒",
    bg: "bg-sky-100",
  },
  {
    title: "Alpha",
    value: stats.value.alpha,
    icon: "❌",
    bg: "bg-rose-100",
  },
]);
</script>

<template>
  <div
    class="grid grid-cols-2 gap-4 lg:grid-cols-5"
  >
    <div
      v-for="card in cards"
      :key="card.title"
      class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-slate-500">
            {{ card.title }}
          </p>

          <h2 class="mt-2 text-3xl font-bold text-slate-800">
            {{ card.value }}
          </h2>
        </div>

        <div
          class="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
          :class="card.bg"
        >
          {{ card.icon }}
        </div>
      </div>
    </div>
  </div>
</template>