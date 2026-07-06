<script setup lang="ts">
import { computed } from "vue";
import { useAttendanceStore } from "@/stores/attendance";
import AttendanceRow from "./AttendanceRow.vue";

const attendance = useAttendanceStore();

// Hanya tampilkan yang belum di-hide
const visibleItems = computed(() =>
  attendance.items.filter(item => !item.hidden)
);

// Total yang masih tampil
const total = computed(() => visibleItems.value.length);
</script>

<template>
  <section
    class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
  >
    <!-- Header -->
    <div
      class="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h2 class="text-xl font-bold text-slate-800">
          Daftar Mahasantri
        </h2>

        <p class="mt-1 text-sm text-slate-500">
          Pilih status kehadiran setiap mahasantri kemudian simpan absensi.
        </p>
      </div>

      <div
        class="inline-flex items-center gap-2 self-start rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700"
      >
        👥 {{ total }} Mahasantri
      </div>
    </div>

    <!-- List -->
    <div class="bg-slate-50 p-4 md:p-6">
      <div class="space-y-4">
        <AttendanceRow
          v-for="(item, index) in visibleItems"
          :key="item.registrasi_kelas_id"
          :item="item"
          :index="index"
        />

        <!-- Kalau semua sudah di-scan -->
        <div
          v-if="visibleItems.length === 0"
          class="rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center text-slate-500"
        >
          🎉 Semua mahasantri sudah diproses.
        </div>
      </div>
    </div>
  </section>
</template>