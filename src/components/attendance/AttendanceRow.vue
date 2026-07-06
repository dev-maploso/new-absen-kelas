<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useAttendanceStore } from "@/stores/attendance";
import type { AttendanceItem, AttendanceStatus } from "@/types/attendance";

const attendance = useAttendanceStore();

const props = defineProps<{
  item: AttendanceItem;
  index: number;
}>();

const saving = ref(false);
const saved = ref(false);

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

watch(
  () => props.item.attendance.status,
  (status) => {
    if (status === "hadir") {
      props.item.attendance.keterangan = null;

      if (!props.item.attendance.jam_hadir) {
        props.item.attendance.jam_hadir = formatTime(new Date());
      }

      return;
    }

    if (!status) {
      props.item.attendance.jam_hadir = null;
      props.item.attendance.keterangan = null;
      return;
    }

    props.item.attendance.jam_hadir = null;
  }
);

async function setStatus(status: AttendanceStatus) {
  if (saving.value) return;

  const oldStatus = props.item.attendance.status;

  props.item.attendance.status = status;

  if (status === "hadir" && !props.item.attendance.jam_hadir) {
    props.item.attendance.jam_hadir = formatTime(new Date());
  }

  if (status !== "hadir") {
    props.item.attendance.jam_hadir = null;
  }

  saving.value = true;
  saved.value = false;

  try {
    await attendance.saveOne(props.item);

    saved.value = true;

    setTimeout(() => {
      saved.value = false;
    }, 1500);

    attendance.statistics[oldStatus as keyof typeof attendance.statistics]--;

    attendance.statistics[status]++;
  } catch (e) {
    props.item.attendance.status = oldStatus;
    console.error(e);
  } finally {
    saving.value = false;
  }
}

const cardClass = computed(() => {
  switch (props.item.attendance.status) {
    case "hadir":
      return "border-emerald-300 bg-emerald-50";

    case "izin":
      return "border-amber-300 bg-amber-50";

    case "sakit":
      return "border-sky-300 bg-sky-50";

    case "alpha":
      return "border-rose-300 bg-rose-50";

    default:
      return "border-slate-200 bg-white";
  }
});

</script>

<template>
  <div
    :id="`attendance-card-${item.registrasi_kelas_id}`"
    :class="[
      'rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:shadow-lg scroll-mt-24',
      cardClass,
    ]"
  >
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <h3 class="text-lg font-bold text-slate-800">
          {{ index + 1 }}. {{ item.mahasantri.nama }}
        </h3>

        <span
          class="mt-2 inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm"
        >
          🏠 {{ item.mahasantri.kamar ?? "-" }}
        </span>
      </div>

      <div class="flex items-center gap-2">

        <svg
          v-if="saving"
          class="h-5 w-5 animate-spin text-indigo-600"
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
            class="opacity-80"
            fill="currentColor"
            d="M12 2a10 10 0 0110 10h-4a6 6 0 00-6-6V2z"
          />
        </svg>

        <span
          v-if="saved"
          class="rounded-full bg-emerald-600 px-2 py-1 text-xs font-bold text-white"
        >
          ✓ Tersimpan
        </span>

        <span
          v-if="item.attendance.status"
          class="rounded-full px-3 py-1 text-xs font-semibold"
          :class="{
            'bg-emerald-600 text-white': item.attendance.status === 'hadir',
            'bg-amber-500 text-white': item.attendance.status === 'izin',
            'bg-sky-600 text-white': item.attendance.status === 'sakit',
            'bg-rose-600 text-white': item.attendance.status === 'alpha',
          }"
        >
          {{
            item.attendance.status === "hadir"
              ? "Hadir"
              : item.attendance.status === "izin"
              ? "Izin"
              : item.attendance.status === "sakit"
              ? "Sakit"
              : "Alpha"
          }}
        </span>

      </div>
    </div>

    <!-- Tombol -->
    <div class="mt-6 grid grid-cols-4 gap-3">

      <button
        @click="setStatus('hadir')"
        :disabled="saving"
        :class="[
          'rounded-xl py-3 text-lg font-bold transition disabled:opacity-50',
          item.attendance.status === 'hadir'
            ? 'scale-105 bg-emerald-600 text-white shadow-lg'
            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
        ]"
      >
        M
      </button>

      <button
        @click="setStatus('izin')"
        :disabled="saving"
        :class="[
          'rounded-xl py-3 text-lg font-bold transition disabled:opacity-50',
          item.attendance.status === 'izin'
            ? 'scale-105 bg-amber-500 text-white shadow-lg'
            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
        ]"
      >
        I
      </button>

      <button
        @click="setStatus('sakit')"
        :disabled="saving"
        :class="[
          'rounded-xl py-3 text-lg font-bold transition disabled:opacity-50',
          item.attendance.status === 'sakit'
            ? 'scale-105 bg-sky-600 text-white shadow-lg'
            : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
        ]"
      >
        S
      </button>

      <button
        @click="setStatus('alpha')"
        :disabled="saving"
        :class="[
          'rounded-xl py-3 text-lg font-bold transition disabled:opacity-50',
          item.attendance.status === 'alpha'
            ? 'scale-105 bg-rose-600 text-white shadow-lg'
            : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
        ]"
      >
        A
      </button>

    </div>

    <div
      v-if="item.attendance.status === 'hadir'"
      class="mt-6"
    >
      <label class="mb-2 block text-sm font-semibold text-slate-700">
        Jam Hadir
      </label>

      <input
        type="time"
        v-model="item.attendance.jam_hadir"
        class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
      />
    </div>

    <div
      v-if="['izin','sakit','alpha'].includes(item.attendance.status ?? '')"
      class="mt-6"
    >
      <label class="mb-2 block text-sm font-semibold text-slate-700">
        Keterangan
      </label>

      <textarea
        rows="2"
        v-model="item.attendance.keterangan"
        class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        placeholder="Masukkan keterangan..."
      />
    </div>

  </div>
</template>