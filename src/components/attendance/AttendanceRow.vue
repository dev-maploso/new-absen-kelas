<script setup lang="ts">
import { watch } from "vue";
import type { AttendanceItem } from "@/types/attendance";

const props = defineProps<{
  item: AttendanceItem;
  index: number;
}>();

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5); // 🔥 clean & safe
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
</script>

<template>
  <tr class="border-b hover:bg-slate-50">

    <td class="px-3 py-2 text-center">
      {{ index + 1 }}
    </td>

    <td class="px-3 py-2 font-semibold">
      {{ item.mahasantri.nama }}
    </td>

    <td class="px-3 py-2">
      <span class="text-xs bg-gray-100 px-2 py-1 rounded">
        {{ item.mahasantri.kamar ?? "-" }}
      </span>
    </td>

    <td class="px-3 py-2">
      <select
        v-model="item.attendance.status"
        class="border rounded px-2 py-1 w-full"
      >
        <option :value="null">-</option>
        <option value="hadir">Hadir</option>
        <option value="izin">Izin</option>
        <option value="sakit">Sakit</option>
        <option value="alpha">Alpha</option>
      </select>
    </td>

    <td class="px-3 py-2">
      <input
        type="time"
        v-model="item.attendance.jam_hadir"
        class="border rounded px-2 py-1 w-full"
        :disabled="item.attendance.status !== 'hadir'"
      />
    </td>

    <td class="px-3 py-2">
      <input
        type="text"
        v-model="item.attendance.keterangan"
        class="border rounded px-2 py-1 w-full"
        :disabled="item.attendance.status === 'hadir' || !item.attendance.status"
      />
    </td>
  </tr>
</template>