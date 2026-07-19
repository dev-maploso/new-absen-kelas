<script setup lang="ts">
import { onMounted } from "vue";
import { useAttendanceStore } from "@/stores/attendance";

const attendance = useAttendanceStore();

onMounted(() => {
  attendance.quickFilter = "empty";
});

const filters = [
  {
    value: "all",
    label: "Semua",
    icon: "📋",
    color: "text-slate-600",
    active: "bg-slate-700 text-white",
    count: () => attendance.items.length,
  },
  {
    value: "empty",
    label: "Belum",
    icon: "⏳",
    color: "text-slate-500",
    active: "bg-slate-600 text-white",
    count: () =>
      attendance.items.filter((x) => !x.attendance.status).length,
  },
  {
    value: "hadir",
    label: "Hadir",
    icon: "✅",
    color: "text-emerald-600",
    active: "bg-emerald-600 text-white",
    count: () => attendance.statistics.hadir,
  },
  {
    value: "izin",
    label: "Izin",
    icon: "📝",
    color: "text-sky-600",
    active: "bg-sky-600 text-white",
    count: () => attendance.statistics.izin,
  },
  {
    value: "sakit",
    label: "Sakit",
    icon: "🤒",
    color: "text-amber-600",
    active: "bg-amber-500 text-white",
    count: () => attendance.statistics.sakit,
  },
  {
    value: "alpha",
    label: "Alpha",
    icon: "❌",
    color: "text-red-600",
    active: "bg-red-600 text-white",
    count: () => attendance.statistics.alpha,
  },
] as const;
</script>

<template>
  <div
    class="grid grid-cols-6 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
  >
    <button
      v-for="filter in filters"
      :key="filter.value"
      @click="attendance.quickFilter = filter.value"
      class="flex flex-col items-center rounded-xl py-2 transition-all duration-200 active:scale-95"
      :class="
        attendance.quickFilter === filter.value
          ? filter.active
          : 'text-slate-600 hover:bg-slate-100'
      "
    >
      <div class="text-xl">
        {{ filter.icon }}
      </div>

      <div class="mt-1 text-[11px] font-semibold">
        {{ filter.label }}
      </div>

      <div
        class="mt-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
        :class="
          attendance.quickFilter === filter.value
            ? 'bg-white/20'
            : 'bg-slate-100'
        "
      >
        {{ filter.count() }}
      </div>
    </button>
  </div>
</template>