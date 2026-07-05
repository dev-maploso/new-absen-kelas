<script setup lang="ts">
import { computed } from "vue";
import { useAttendanceStore } from "@/stores/attendance";

const attendance = useAttendanceStore();

const hasData = computed(() => attendance.items.length > 0);

const emptyCount = computed(() =>
  attendance.items.filter(
    (item) => item.attendance.status === null
  ).length
);

async function saveAttendance() {
  if (emptyCount.value > 0) {
    alert(
      `Masih ada ${emptyCount.value} mahasantri yang belum dipilih status absensinya.`
    );

    return;
  }

  try {
    attendance.loading = true;

    await attendance.save();

    alert("Absensi berhasil disimpan.");

    await attendance.load();
  } catch (error) {
    console.error(error);

    alert("Gagal menyimpan absensi.");
  } finally {
    attendance.loading = false;
  }
}
</script>

<template>
  <div
    v-if="hasData"
    class="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm"
  >
    <div
      class="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h3 class="text-lg font-semibold text-slate-800">
          Simpan Absensi
        </h3>

        <p class="mt-1 text-sm text-slate-500">
          Pastikan seluruh data absensi telah diisi sebelum disimpan.
        </p>

        <div
          v-if="emptyCount > 0"
          class="mt-3 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700"
        >
          ⚠️ {{ emptyCount }} santri belum dipilih status absensinya
        </div>

        <div
          v-else
          class="mt-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700"
        >
          ✅ Semua data absensi sudah lengkap
        </div>
      </div>

      <button
        @click="saveAttendance"
        :disabled="attendance.loading || emptyCount > 0"
        class="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 md:w-auto"
      >
        <svg
          v-if="attendance.loading"
          class="mr-2 h-5 w-5 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
            class="opacity-20"
          />

          <path
            fill="currentColor"
            class="opacity-90"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4A10 10 0 002 12h2z"
          />
        </svg>

        {{ attendance.loading ? "Menyimpan..." : "💾 Simpan Absensi" }}
      </button>
    </div>
  </div>
</template>