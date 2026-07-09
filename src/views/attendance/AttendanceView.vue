<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

import { useAttendanceStore } from "@/stores/attendance";
import { useAuthStore } from "@/stores/auth";

import AttendanceFilter from "@/components/attendance/AttendanceFilter.vue";
import AttendanceDateTime from "@/components/attendance/AttendanceDateTime.vue";
import AttendanceStatistics from "@/components/attendance/AttendanceStatistics.vue";
import AttendanceSearch from "@/components/attendance/AttendanceSearch.vue";
import AttendanceScanner from "@/components/attendance/AttendanceScanner.vue";
import AttendanceTable from "@/components/attendance/AttendanceTable.vue";
import AttendanceActions from "@/components/attendance/AttendanceActions.vue";
import AttendanceEmpty from "@/components/attendance/AttendanceEmpty.vue";
import AttendanceBackToTop from "@/components/attendance/AttendanceBackToTop.vue";
import AttendanceQuickFilter from "@/components/attendance/AttendanceQuickFilter.vue";

const attendance = useAttendanceStore();
const auth = useAuthStore();

const loaded = ref(false);

const kelas = computed(() => auth.kelas);

onMounted(() => {
  if (kelas.value.length) {
    attendance.kelasId = kelas.value[0].id;
  }
});

async function loadAttendance() {
  loaded.value = false;

  try {
    await attendance.load();
  } finally {
    loaded.value = true;
  }
}
</script>

<template>
  <div class="space-y-6 pb-36">
    <!-- Filter -->
    <AttendanceFilter
      :kelas="kelas"
      @load="loadAttendance"
    />

    <!-- Tanggal & Jam -->
    <AttendanceDateTime />

    <AttendanceEmpty v-if="!loaded" />

    <template v-else>
      <!-- Statistik -->
      <AttendanceStatistics />

      <!-- Scanner -->
      <AttendanceScanner />

      <!-- Search -->
      <AttendanceSearch />

      <!-- Daftar Santri -->
      <AttendanceTable />

      <!-- Tombol Simpan -->
      <AttendanceActions />

      <!-- Floating Back To Top -->
      <AttendanceBackToTop />

      <!-- Bottom Quick Filter -->
      <div
        class="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 shadow-2xl backdrop-blur-md"
      >
        <div class="mx-auto max-w-7xl px-3 pt-3 pb-5">
          <AttendanceQuickFilter />
        </div>
      </div>
    </template>
  </div>
</template>