<script setup lang="ts">
import { onMounted } from "vue";

import { useAuthStore } from "@/stores/auth";
import { useAttendanceRecapStore } from "@/stores/attendanceRecap";

const auth = useAuthStore();
const recap = useAttendanceRecapStore();

onMounted(() => {
  if (!recap.kelasId && auth.defaultKelas) {
    recap.kelasId = auth.defaultKelas.id;
  }
});

async function loadRecap() {
  await recap.load();
}
</script>

<template>
  <div class="space-y-6">
    <!-- Filter -->
    <div class="rounded-xl bg-white p-6 shadow">
      <h1 class="mb-6 text-2xl font-bold">
        Rekap Absensi
      </h1>

      <div class="grid gap-4 md:grid-cols-4">
        <!-- Kelas -->
        <div>
          <label class="mb-1 block text-sm font-medium">
            Kelas
          </label>

          <select
            v-model="recap.kelasId"
            class="w-full rounded-lg border px-3 py-2"
          >
            <option
              v-for="kelas in auth.kelas"
              :key="kelas.id"
              :value="kelas.id"
            >
              {{ kelas.nama_kelas }}
            </option>
          </select>
        </div>

        <!-- Tanggal Mulai -->
        <div>
          <label class="mb-1 block text-sm font-medium">
            Tanggal Mulai
          </label>

          <input
            v-model="recap.tanggalMulai"
            type="date"
            class="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <!-- Tanggal Selesai -->
        <div>
          <label class="mb-1 block text-sm font-medium">
            Tanggal Selesai
          </label>

          <input
            v-model="recap.tanggalSelesai"
            type="date"
            class="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <!-- Jam -->
        <div>
          <label class="mb-1 block text-sm font-medium">
            Jam Ke
          </label>

          <select
            v-model="recap.jamKe"
            class="w-full rounded-lg border px-3 py-2"
          >
            <option
              v-for="i in 10"
              :key="i"
              :value="i"
            >
              Jam {{ i }}
            </option>
          </select>
        </div>
      </div>

      <button
        class="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        :disabled="recap.loading"
        @click="loadRecap"
      >
        {{ recap.loading ? "Memuat..." : "Tampilkan Rekap" }}
      </button>
    </div>

    <!-- Statistik -->
    <div
      v-if="recap.items.length"
      class="grid gap-4 md:grid-cols-6"
    >
      <div class="rounded-xl bg-white p-4 shadow">
        <div class="text-sm text-gray-500">
          Santri
        </div>

        <div class="mt-2 text-2xl font-bold">
          {{ recap.statistics.total_santri }}
        </div>
      </div>

      <div class="rounded-xl bg-white p-4 shadow">
        <div class="text-sm text-gray-500">
          Hadir
        </div>

        <div class="mt-2 text-2xl font-bold text-green-600">
          {{ recap.statistics.total_hadir }}
        </div>
      </div>

      <div class="rounded-xl bg-white p-4 shadow">
        <div class="text-sm text-gray-500">
          Izin
        </div>

        <div class="mt-2 text-2xl font-bold text-yellow-500">
          {{ recap.statistics.total_izin }}
        </div>
      </div>

      <div class="rounded-xl bg-white p-4 shadow">
        <div class="text-sm text-gray-500">
          Sakit
        </div>

        <div class="mt-2 text-2xl font-bold text-blue-600">
          {{ recap.statistics.total_sakit }}
        </div>
      </div>

      <div class="rounded-xl bg-white p-4 shadow">
        <div class="text-sm text-gray-500">
          Alpha
        </div>

        <div class="mt-2 text-2xl font-bold text-red-600">
          {{ recap.statistics.total_alpha }}
        </div>
      </div>

      <div class="rounded-xl bg-white p-4 shadow">
        <div class="text-sm text-gray-500">
          Total
        </div>

        <div class="mt-2 text-2xl font-bold">
          {{ recap.statistics.total_absensi }}
        </div>
      </div>
    </div>

    <!-- Tabel -->
    <div
      v-if="recap.items.length"
      class="overflow-x-auto rounded-xl bg-white shadow"
    >
      <table class="min-w-full">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-3 text-left">
              Nama
            </th>

            <th class="px-4 py-3 text-left">
              Kamar
            </th>

            <th class="px-4 py-3 text-center">
              H
            </th>

            <th class="px-4 py-3 text-center">
              I
            </th>

            <th class="px-4 py-3 text-center">
              S
            </th>

            <th class="px-4 py-3 text-center">
              A
            </th>

            <th class="px-4 py-3 text-center">
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in recap.items"
            :key="item.registrasi_kelas_id"
            class="border-t"
          >
            <td class="px-4 py-3 font-medium">
              {{ item.mahasantri.nama }}
            </td>

            <td class="px-4 py-3">
              {{ item.mahasantri.kamar ?? "-" }}
            </td>

            <td class="px-4 py-3 text-center text-green-600">
              {{ item.rekap.hadir }}
            </td>

            <td class="px-4 py-3 text-center text-yellow-500">
              {{ item.rekap.izin }}
            </td>

            <td class="px-4 py-3 text-center text-blue-600">
              {{ item.rekap.sakit }}
            </td>

            <td class="px-4 py-3 text-center text-red-600">
              {{ item.rekap.alpha }}
            </td>

            <td class="px-4 py-3 text-center font-bold">
              {{ item.rekap.total }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!recap.loading"
      class="rounded-xl bg-white p-10 text-center text-gray-500 shadow"
    >
      Belum ada data rekap.
    </div>
  </div>
</template>