<script setup lang="ts">
import { useAttendanceStore } from "@/stores/attendance";

const attendance = useAttendanceStore();

const jamList = Array.from(
  { length: 2 },
  (_, i) => i + 1,
);

function isChecked(jam: number) {
  return attendance.selectedJamKe.includes(jam);
}

function toggle(jam: number) {
  attendance.toggleJamKe(jam);
}
</script>

<template>
  <div class="rounded-2xl border bg-white p-5 shadow-sm">
    <div class="mb-4">
      <h3 class="font-semibold text-slate-800">
        Jam Input Izin
      </h3>

      <p class="mt-1 text-sm text-slate-500">
        Pilih jam-jam yang akan langsung diinput saat scan QR izin.
      </p>
    </div>

    <div class="grid grid-cols-5 gap-3">
      <button
        v-for="jam in jamList"
        :key="jam"
        type="button"
        @click="toggle(jam)"
        class="rounded-xl border py-3 text-center font-semibold transition-all duration-200"
        :class="
          isChecked(jam)
            ? 'border-blue-600 bg-blue-600 text-white shadow'
            : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50'
        "
      >
        Jam {{ jam }}
      </button>
    </div>

    <div
      class="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600"
    >
      <span class="font-medium">Jam dipilih:</span>

      <span
        v-if="attendance.selectedJamKe.length"
        class="font-semibold text-blue-600"
      >
        {{ attendance.selectedJamKe.join(", ") }}
      </span>

      <span
        v-else
        class="text-slate-400"
      >
        Belum ada
      </span>
    </div>
  </div>
</template>