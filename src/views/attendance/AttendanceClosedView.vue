<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { Clock, LayoutDashboard } from "lucide-vue-next";

import { ATTENDANCE_RESTRICTIONS } from "@/config/attendance-restrictions";
import {
  formatJakartaDate,
  formatJakartaTime,
  getAttendanceDeadlineLabel,
} from "@/helpers/attendance-restrictions";
import {
  getTrustedNow,
  isServerClockSynced,
} from "@/helpers/server-clock";

const now = ref(getTrustedNow());
const timeSource = ref(
  isServerClockSynced() ? "Waktu server (WIB)" : "Waktu perangkat (WIB)",
);

const deadlineLabel = getAttendanceDeadlineLabel(ATTENDANCE_RESTRICTIONS);

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
          Absensi Telah Ditutup
        </h1>

        <p class="mt-3 text-sm text-slate-600 sm:text-base">
          Waktu pengisian absensi untuk kelas Anda telah berakhir.
        </p>
      </div>

      <div class="space-y-5 p-6 sm:p-10">
        <div
          class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-center text-sm font-medium text-amber-800 sm:text-base"
        >
          Batas pengisian absensi adalah pukul
          <span class="font-bold">{{ deadlineLabel }} WIB</span>.
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
