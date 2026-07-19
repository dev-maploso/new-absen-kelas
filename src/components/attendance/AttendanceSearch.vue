<script setup lang="ts">
import { computed, ref } from "vue";
import { useAttendanceStore } from "@/stores/attendance";
import type { AttendanceItem } from "@/types/attendance";

const attendance = useAttendanceStore();

const keyword = ref("");
const show = ref(false);

function onInput(event: Event) {
  keyword.value = (event.target as HTMLInputElement).value;
  show.value = keyword.value.trim().length > 0;
}

const suggestions = computed(() => {
  const q = keyword.value.trim().toLowerCase();

  if (!q) return [];

  return attendance.items
    .filter(item => !item.hidden)
    .filter(item =>
      item.mahasantri.nama.toLowerCase().includes(q)
    )
    .slice(0, 8);
});

function select(item: AttendanceItem) {
  keyword.value = "";
  show.value = false;

  const input = document.getElementById(
    "attendance-search"
  ) as HTMLInputElement | null;

  input?.blur();

  window.setTimeout(() => {
    const el = document.getElementById(
      `attendance-card-${item.registrasi_kelas_id}`
    );

    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    el.classList.add("ring-4", "ring-indigo-400");

    window.setTimeout(() => {
      el.classList.remove("ring-4", "ring-indigo-400");
    }, 2000);
  }, 250);
}

function hideSuggestion() {
  window.setTimeout(() => {
    show.value = false;
  }, 200);
}
</script>

<template>
  <div class="relative mb-6">
    <input
      id="attendance-search"
      :value="keyword"
      @input="onInput"
      @focus="show = keyword.trim().length > 0"
      @blur="hideSuggestion"
      type="search"
      inputmode="search"
      enterkeyhint="search"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      placeholder="🔍 Cari nama mahasantri..."
      class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
    />

    <div
      v-if="show && suggestions.length"
      class="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border bg-white shadow-xl"
    >
      <button
        v-for="item in suggestions"
        :key="item.registrasi_kelas_id"
        @click="select(item)"
        class="flex w-full items-center justify-between border-b px-4 py-3 text-left hover:bg-slate-100 last:border-b-0"
      >
        <div>
          <div class="font-semibold">
            {{ item.mahasantri.nama }}
          </div>

          <div class="text-xs text-slate-500">
            🏠 {{ item.mahasantri.kamar ?? "-" }}
          </div>
        </div>

        <div
          v-if="item.attendance.status"
          class="text-xs text-slate-500"
        >
          {{ item.attendance.status }}
        </div>
      </button>
    </div>
  </div>
</template>