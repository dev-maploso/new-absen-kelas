<script setup lang="ts">
import { ref, watch } from "vue";

import pembayaranService from "@/services/pembayaran.service";
import { usePembayaranStore } from "@/stores/pembayaran";

import type { PembayaranSearchItem } from "@/types/pembayaran";

const pembayaran = usePembayaranStore();

const keyword = ref("");

const loading = ref(false);
const show = ref(false);

const suggestions = ref<PembayaranSearchItem[]>([]);

let debounce: number | undefined;

watch(keyword, (value) => {
  window.clearTimeout(debounce);

  if (!value.trim()) {
    suggestions.value = [];
    return;
  }

  debounce = window.setTimeout(async () => {
    loading.value = true;

    try {
      const { data } = await pembayaranService.search({
        keyword: value,
        limit: 8,
      });

      suggestions.value = data.data;
    } catch (error) {
      console.error(error);
      suggestions.value = [];
    } finally {
      loading.value = false;
    }
  }, 300);
});

async function select(item: PembayaranSearchItem) {
  keyword.value = item.name;

  show.value = false;
  suggestions.value = [];

  const input = document.getElementById(
    "pembayaran-search",
  ) as HTMLInputElement | null;

  input?.blur();

  await pembayaran.fetchDetail(item.id);
}

function hideSuggestion() {
  window.setTimeout(() => {
    show.value = false;
  }, 200);
}
</script>

<template>
  <div class="relative">
    <input
      id="pembayaran-search"
      v-model="keyword"
      @focus="show = true"
      @blur="hideSuggestion"
      type="text"
      placeholder="🔍 Cari nama / NIM mahasantri..."
      class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
    />

    <div
      v-if="loading"
      class="absolute right-4 top-3 text-sm text-slate-500"
    >
      Mencari...
    </div>

    <div
      v-if="show && suggestions.length"
      class="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border bg-white shadow-xl"
    >
      <button
        v-for="item in suggestions"
        :key="item.id"
        @click="select(item)"
        class="flex w-full items-center justify-between border-b px-4 py-3 text-left transition hover:bg-slate-100 last:border-b-0"
      >
        <div>
          <div class="font-semibold">
            {{ item.name }}
          </div>

          <div class="text-xs text-slate-500">
            {{ item.nim }}
          </div>
        </div>

        <div class="text-right">
          <div
            class="text-xs font-semibold"
            :class="
              item.kekurangan <= 0
                ? 'text-green-600'
                : 'text-orange-600'
            "
          >
            {{ item.status }}
          </div>

          <div class="text-xs text-slate-500">
         
          </div>
        </div>
      </button>
    </div>

    <div
      v-if="
        show &&
        keyword &&
        !loading &&
        suggestions.length === 0
      "
      class="absolute z-50 mt-2 w-full rounded-xl border bg-white p-4 text-center text-sm text-slate-500 shadow-xl"
    >
      Mahasantri tidak ditemukan.
    </div>
  </div>
</template>