<script setup lang="ts">
import { computed } from "vue";
import { useAttendanceStore } from "@/stores/attendance";
import type { Kelas } from "@/stores/auth";

const props = defineProps<{
  kelas: Kelas[];
}>();

const emit = defineEmits<{
  (e: "load"): void;
}>();

const attendance = useAttendanceStore();

const canLoad = computed(() => {
  return (
    attendance.kelasId !== null &&
    attendance.tanggal !== "" &&
    attendance.jamKe > 0
  );
});

function handleLoad() {
  if (!canLoad.value) return;

  emit("load");
}
</script>

<template>
  <div
    class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
  >
    <!-- Header -->
    <div class="border-b border-slate-100 px-6 py-5">
      <h2 class="text-lg font-semibold text-slate-800">
        Input Absensi
      </h2>

      <p class="mt-1 text-sm text-slate-500">
        Pilih kelas, tanggal, dan jam pelajaran kemudian tampilkan data
        absensi.
      </p>
    </div>

    <!-- Form -->
    <div class="p-6">
      <div
        class="grid grid-cols-1 gap-5 lg:grid-cols-12"
      >
        <!-- Kelas -->
        <div class="lg:col-span-5">
          <label
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Kelas
          </label>

          <select
            v-model="attendance.kelasId"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          >
            <option
              v-for="item in props.kelas"
              :key="item.id"
              :value="item.id"
            >
              {{ item.nama_kelas }}
            </option>
          </select>
        </div>

        <!-- Tanggal -->
        <div class="lg:col-span-3">
          <label
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Tanggal
          </label>

          <input
            type="date"
            v-model="attendance.tanggal"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <!-- Jam -->
        <div class="lg:col-span-2">
          <label
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Jam Ke
          </label>

          <select
            v-model="attendance.jamKe"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          >
            <option
              v-for="i in 2"
              :key="i"
              :value="i"
            >
              {{ i }}
            </option>
          </select>
        </div>

        <!-- Button -->
        <div
          class="flex items-end lg:col-span-2"
        >
          <button
            @click="handleLoad"
            :disabled="attendance.loading || !canLoad"
            class="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <svg
              v-if="attendance.loading"
              class="mr-2 h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />

              <path
                class="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4A10 10 0 002 12h2z"
              />
            </svg>

            {{ attendance.loading ? "Memuat..." : "Tampilkan Data" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>