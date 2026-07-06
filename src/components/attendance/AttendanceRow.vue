<script setup lang="ts">
import { computed, watch } from "vue";
import type { AttendanceItem, AttendanceStatus } from "@/types/attendance";

const props = defineProps<{
  item: AttendanceItem;
  index: number;
}>();

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

function setStatus(status: AttendanceStatus) {
  props.item.attendance.status = status;
}

watch(
  () => props.item.attendance.status,
  (status) => {
    if (status === "hadir") {
      props.item.attendance.keterangan = null;

      if (!props.item.attendance.jam_hadir) {
        props.item.attendance.jam_hadir = formatTime(new Date());
      }

      return;
    }

    if (!status) {
      props.item.attendance.jam_hadir = null;
      props.item.attendance.keterangan = null;
      return;
    }

    props.item.attendance.jam_hadir = null;
  }
);

const cardClass = computed(() => {
  switch (props.item.attendance.status) {
    case "hadir":
      return "border-emerald-300 bg-emerald-50";

    case "izin":
      return "border-amber-300 bg-amber-50";

    case "sakit":
      return "border-sky-300 bg-sky-50";

    case "alpha":
      return "border-rose-300 bg-rose-50";

    default:
      return "border-slate-200 bg-white";
  }
});
</script>

<template>
  <div
    :class="[
      'rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:shadow-lg',
      cardClass,
    ]"
  >
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <h3 class="text-lg font-bold text-slate-800">
          {{ index + 1 }}. {{ item.mahasantri.nama }}
        </h3>

        <span
          class="mt-2 inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm"
        >
          🏠 {{ item.mahasantri.kamar ?? "-" }}
        </span>
      </div>

      <span
        v-if="item.attendance.status"
        class="rounded-full px-3 py-1 text-xs font-semibold"
        :class="{
          'bg-emerald-600 text-white': item.attendance.status === 'hadir',
          'bg-amber-500 text-white': item.attendance.status === 'izin',
          'bg-sky-600 text-white': item.attendance.status === 'sakit',
          'bg-rose-600 text-white': item.attendance.status === 'alpha',
        }"
      >
        {{
          item.attendance.status === "hadir"
            ? "Hadir"
            : item.attendance.status === "izin"
            ? "Izin"
            : item.attendance.status === "sakit"
            ? "Sakit"
            : "Alpha"
        }}
      </span>
    </div>

    <!-- Status -->
    <div class="mt-6 grid grid-cols-4 gap-3">
      <button
        @click="setStatus('hadir')"
        :class="[
          'rounded-xl py-3 text-lg font-bold transition-all duration-200',
          item.attendance.status === 'hadir'
            ? 'scale-105 bg-emerald-600 text-white shadow-lg'
            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
        ]"
      >
        M
      </button>

      <button
        @click="setStatus('izin')"
        :class="[
          'rounded-xl py-3 text-lg font-bold transition-all duration-200',
          item.attendance.status === 'izin'
            ? 'scale-105 bg-amber-500 text-white shadow-lg'
            : 'bg-amber-100 text-amber-700 hover:bg-amber-200',
        ]"
      >
        I
      </button>

      <button
        @click="setStatus('sakit')"
        :class="[
          'rounded-xl py-3 text-lg font-bold transition-all duration-200',
          item.attendance.status === 'sakit'
            ? 'scale-105 bg-sky-600 text-white shadow-lg'
            : 'bg-sky-100 text-sky-700 hover:bg-sky-200',
        ]"
      >
        S
      </button>

      <button
        @click="setStatus('alpha')"
        :class="[
          'rounded-xl py-3 text-lg font-bold transition-all duration-200',
          item.attendance.status === 'alpha'
            ? 'scale-105 bg-rose-600 text-white shadow-lg'
            : 'bg-rose-100 text-rose-700 hover:bg-rose-200',
        ]"
      >
        A
      </button>
    </div>

    <!-- Jam Hadir -->
    <transition name="fade">
      <div
        v-if="item.attendance.status === 'hadir'"
        class="mt-6"
      >
        <label class="mb-2 block text-sm font-semibold text-slate-700">
          Jam Hadir
        </label>

        <input
          type="time"
          v-model="item.attendance.jam_hadir"
          class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
      </div>
    </transition>

    <!-- Keterangan -->
    <transition name="fade">
      <div
        v-if="
          item.attendance.status === 'izin' ||
          item.attendance.status === 'sakit' ||
          item.attendance.status === 'alpha'
        "
        class="mt-6"
      >
        <label class="mb-2 block text-sm font-semibold text-slate-700">
          Keterangan
        </label>

        <textarea
          v-model="item.attendance.keterangan"
          rows="2"
          placeholder="Masukkan keterangan..."
          class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>