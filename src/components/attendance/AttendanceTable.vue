<script setup lang="ts">
import { useAttendanceStore } from "@/stores/attendance";
import AttendanceRow from "./AttendanceRow.vue";

const attendance = useAttendanceStore();
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
  >
    <!-- Header -->
    <div
      class="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h2 class="text-lg font-semibold text-slate-800">
          Daftar Mahasantri
        </h2>

        <p class="mt-1 text-sm text-slate-500">
          Silakan lengkapi absensi setiap mahasantri.
        </p>
      </div>

      <div
        class="inline-flex items-center rounded-full bg-indigo-50 px-4 py-1 text-sm font-medium text-indigo-600"
      >
        {{ attendance.items.length }} Mahasantri
      </div>
    </div>

    <!-- DESKTOP TABLE -->
    <div class="hidden md:block overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
              No
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
              Nama
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
              Kamar
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
              Status
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
              Jam Hadir
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
              Keterangan
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <AttendanceRow
            v-for="(item, index) in attendance.items"
            :key="item.registrasi_kelas_id"
            :item="item"
            :index="index"
          />
        </tbody>
      </table>
    </div>

    <!-- MOBILE MODE (CARD LIST) -->
    <div class="md:hidden divide-y divide-slate-100">
      <div
        v-for="(item, index) in attendance.items"
        :key="item.registrasi_kelas_id"
        class="p-4"
      >
        <AttendanceRow :item="item" :index="index" />
      </div>
    </div>
  </div>
</template>