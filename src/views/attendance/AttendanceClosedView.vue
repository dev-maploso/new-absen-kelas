<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { Clock, LayoutDashboard } from "lucide-vue-next";

import { ATTENDANCE_RESTRICTIONS } from "@/config/attendance-restrictions";
import {
  formatJakartaDate,
  formatJakartaTime,
  getAttendanceBlockedFromLabel,
  getAttendanceBlockedUntilLabel,
  shouldBlockAttendance,
} from "@/helpers/attendance-restrictions";
import {
  getTrustedNow,
  isServerClockSynced,
} from "@/helpers/server-clock";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const now = ref(getTrustedNow());
const timeSource = ref(
  isServerClockSynced() ? "Waktu server (WIB)" : "Waktu perangkat (WIB)",
);

const blockedFromLabel = getAttendanceBlockedFromLabel(
  ATTENDANCE_RESTRICTIONS,
);
const blockedUntilLabel = getAttendanceBlockedUntilLabel(
  ATTENDANCE_RESTRICTIONS,
);

/**
 * Reaktif terhadap jam yang terus diperbarui. Begitu pukul 10.30 WIB tiba,
 * tombol kembali ke absensi otomatis muncul tanpa redirect paksa (menghindari
 * redirect loop dengan router guard).
 */
const stillBlocked = computed(() =>
  shouldBlockAttendance(
    auth.kelas,
    now.value,
    ATTENDANCE_RESTRICTIONS,
  ),
);

const canReturnToAttendance = computed(() => !stillBlocked.value);

const currentDate = computed(() =>
  formatJakartaDate(now.value, ATTENDANCE_RESTRICTIONS),
);
const currentTime = computed(() =>
  formatJakartaTime(now.value, ATTENDANCE_RESTRICTIONS),
);

let timer: number | undefined;

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = getTrustedNow();
    timeSource.value = isServerClockSynced()
      ? "Waktu server (WIB)"
      : "Waktu perangkat (WIB)";
  }, 1000);
});

onBeforeUnmount(() => {
  if (timer !== undefined) {
    window.clearInterval(timer);
  }
});
</script>

<template>
  <div class="flex min-h-[70vh] items-center justify-center pb-10">
    <section
      class="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div
        class="border-b border-slate-100 bg-gradient-to-b from-rose-50 to-white px-6 py-8 text-center sm:px-10 sm:py-10"
      >
        <div
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600"
        >
          <Clock :size="32" />
        </div>

        <h1 class="mt-5 text-2xl font-bold text-slate-800 sm:text-3xl">
          Absensi Ditutup Sementara
        </h1>

        <p class="mt-3 text-sm text-slate-600 sm:text-base">
          Pengisian absensi kelas Anda sedang ditutup sementara.
        </p>
      </div>

      <div class="space-y-5 p-6 sm:p-10">
        <div
          class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-center text-sm font-medium text-amber-800 sm:text-base"
        >
          Absensi akan dibuka kembali pukul
          <span class="font-bold">{{ blockedUntilLabel }} WIB</span>.
        </div>

        <div
          class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500 sm:text-sm"
        >
          Pembatasan sementara berlaku pukul
          <span class="font-semibold text-slate-700">
            {{ blockedFromLabel }}–{{ blockedUntilLabel }} WIB
          </span>
          untuk kelas yang diatur.
        </div>

        <div
          v-if="canReturnToAttendance"
          class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-center text-sm font-medium text-emerald-800 sm:text-base"
        >
          Absensi sudah dibuka kembali. Silakan lanjutkan pengisian absensi
          seperti biasa.
        </div>

        <div class="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Tanggal dan waktu saat ini
          </p>

          <p class="mt-2 text-lg font-semibold text-slate-800 sm:text-xl">
            {{ currentDate }}
          </p>

          <p
            class="mt-1 text-3xl font-bold tracking-wider text-indigo-600 sm:text-4xl"
          >
            {{ currentTime }} WIB
          </p>

          <p class="mt-2 text-xs text-slate-400">
            {{ timeSource }}
          </p>
        </div>

        <RouterLink
          v-if="canReturnToAttendance"
          :to="{ name: 'attendance' }"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
        >
          Kembali ke Absensi
        </RouterLink>

        <RouterLink
          :to="{ name: 'dashboard' }"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
        >
          <LayoutDashboard :size="20" />
          Kembali ke Dashboard
        </RouterLink>

        <p class="text-center text-xs text-slate-500 sm:text-sm">
          Anda tetap dapat menggunakan dashboard, profil, dan fitur lain seperti
          biasa.
        </p>
      </div>
    </section>
  </div>
</template>
