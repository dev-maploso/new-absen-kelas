<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

import { useAttendanceStore } from "@/stores/attendance";
import { useAuthStore } from "@/stores/auth";
import { ATTENDANCE_RESTRICTIONS } from "@/config/attendance-restrictions";
import { shouldBlockAttendance } from "@/helpers/attendance-restrictions";
import { getTrustedNow } from "@/helpers/server-clock";

import AttendanceFilter from "@/components/attendance/AttendanceFilter.vue";
import AttendanceDateTime from "@/components/attendance/AttendanceDateTime.vue";
import AttendanceSearch from "@/components/attendance/AttendanceSearch.vue";
import AttendanceScanner from "@/components/attendance/AttendanceScanner.vue";
import AttendanceTable from "@/components/attendance/AttendanceTable.vue";
import AttendanceActions from "@/components/attendance/AttendanceActions.vue";
import AttendanceEmpty from "@/components/attendance/AttendanceEmpty.vue";
import AttendanceBackToTop from "@/components/attendance/AttendanceBackToTop.vue";
import AttendanceQuickFilter from "@/components/attendance/AttendanceQuickFilter.vue";
import AttendanceJamSelector from "@/components/attendance/AttendanceJamSelector.vue";

const attendance = useAttendanceStore();
const auth = useAuthStore();
const router = useRouter();

const loaded = ref(false);

const kelas = computed(() => auth.kelas);

const scanEnabled = ref(false);

const now = ref(getTrustedNow());

/**
 * Status reaktif dipakai untuk menyembunyikan form/tombol submit segera
 * setelah masuk periode penutupan.
 */
const attendanceBlocked = computed(() =>
  shouldBlockAttendance(
    kelas.value,
    now.value,
    ATTENDANCE_RESTRICTIONS,
  ),
);

let restrictionTimer: number | undefined;

function stopRestrictionTimer() {
  if (restrictionTimer !== undefined) {
    window.clearInterval(restrictionTimer);
    restrictionTimer = undefined;
  }
}

/**
 * Pemeriksaan berkala agar halaman yang sudah terbuka sebelum pukul 09.45
 * ikut tertutup otomatis ketika rentang penutupan dimulai.
 */
function enforceAttendanceWindow() {
  now.value = getTrustedNow();

  if (!attendanceBlocked.value) {
    return;
  }

  stopRestrictionTimer();
  void router.replace({ name: "attendance-closed" });
}

onMounted(() => {
  if (kelas.value.length) {
    attendance.kelasId = kelas.value[0].id;
  }

  enforceAttendanceWindow();

  if (!attendanceBlocked.value) {
    restrictionTimer = window.setInterval(enforceAttendanceWindow, 1000);
  }
});

onBeforeUnmount(() => {
  stopRestrictionTimer();
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
  <!--
    Pengaman tambahan: saat status berubah menjadi ditutup, form dan tombol
    submit langsung tidak dirender sebelum navigasi ke halaman penutupan.
  -->
  <div
    v-if="attendanceBlocked"
    class="flex min-h-[50vh] items-center justify-center"
  >
    <p class="text-center text-sm font-medium text-slate-600">
      Absensi sedang ditutup sementara. Mengalihkan ke halaman informasi...
    </p>
  </div>

  <div v-else class="space-y-6 pb-36">
    <!-- Filter -->
    <AttendanceFilter
      :kelas="kelas"
      @load="loadAttendance"
    />

    <!-- Tanggal & Jam -->
    <AttendanceDateTime />
    <AttendanceJamSelector />

    <AttendanceEmpty v-if="!loaded" />

    <template v-else>
      <!-- Statistik -->
      <!-- <AttendanceStatistics /> -->

      <!-- Tombol Scan -->
      <div class="flex justify-end">
        <button
          @click="scanEnabled = !scanEnabled"
          :class="[
            'rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition',
            scanEnabled
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          ]"
        >
          {{ scanEnabled ? "🚫 Matikan Scanner" : "📷 Aktifkan Scanner" }}
        </button>
      </div>

      <!-- Scanner -->
      <AttendanceScanner v-if="scanEnabled" />

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