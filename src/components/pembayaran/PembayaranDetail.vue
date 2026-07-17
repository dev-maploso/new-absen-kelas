<script setup lang="ts">
import { computed } from "vue";

import { usePembayaranStore } from "@/stores/pembayaran";

const pembayaran = usePembayaranStore();

const detail = computed(() => pembayaran.detail);

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusClass(status: string) {
  return status === "lunas"
    ? "bg-green-100 text-green-700"
    : "bg-orange-100 text-orange-700";
}
</script>

<template>
  <div
    v-if="detail"
    class="space-y-6"
  >

    <!-- HEADER MAHASANTRI -->
    <section
      class="rounded-2xl border bg-white p-6 shadow-sm"
    >
      <div
        class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >

        <div>
          <h2 class="text-xl font-bold text-slate-800">
            {{ detail.mahasantri?.name }}
          </h2>

          <p class="text-sm text-slate-500">
            NIM:
            {{ detail.mahasantri?.nim }}
          </p>

          <p class="text-sm text-slate-500">
            Tahun Ajaran:
           {{ detail.tahun_ajaran?.nama }}
          </p>
        </div>


        <div
          class="rounded-xl px-4 py-3 text-center"
          :class="statusClass(detail.status)"
        >
          <p class="text-xs">
            Status
          </p>

          <p class="font-bold">
            {{ detail.status_label }}
          </p>
        </div>

      </div>
    </section>



    <!-- RINGKASAN -->
    <section
      class="grid grid-cols-1 gap-4 md:grid-cols-3"
    >

      <div
        class="rounded-xl border bg-white p-5"
      >
        <p class="text-sm text-slate-500">
          Kewajiban
        </p>

        <p class="mt-2 text-lg font-bold">
          {{ formatRupiah(detail.kewajiban_bayar) }}
        </p>
      </div>


      <div
        class="rounded-xl border bg-white p-5"
      >
        <p class="text-sm text-slate-500">
          Sudah Bayar
        </p>

        <p class="mt-2 text-lg font-bold text-green-600">
          {{ formatRupiah(detail.sudah_bayar) }}
        </p>
      </div>


      <div
        class="rounded-xl border bg-white p-5"
      >
        <p class="text-sm text-slate-500">
          Kekurangan
        </p>

        <p class="mt-2 text-lg font-bold text-orange-600">
          {{ formatRupiah(detail.kekurangan) }}
        </p>
      </div>

    </section>



    <!-- DETAIL TAGIHAN -->
    <section
      class="rounded-2xl border bg-white shadow-sm"
    >

      <div
        class="border-b px-6 py-4"
      >
        <h3 class="font-bold text-slate-800">
          Rincian Pembayaran
        </h3>
      </div>


      <div
        v-if="detail.tagihan?.length"
        class="divide-y"
      >

        <div
          v-for="tagihan in detail.tagihan"
          :key="tagihan.id"
          class="p-6"
        >

          <div
            class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
          >

            <div>

              <h4
                class="font-semibold"
              >
                {{
                  tagihan.pembayaran
                    ?.jenis_pembayaran
                    ?.nama ?? "-"
                }}
              </h4>


            </div>


            <span
              class="rounded-full px-3 py-1 text-xs font-semibold"
              :class="statusClass(tagihan.status)"
            >
              {{ tagihan.status }}
            </span>

          </div>



          <div
            class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3"
          >

            <div>
              <p class="text-xs text-slate-500">
                Kewajiban
              </p>

              <p class="font-semibold">
                {{ formatRupiah(tagihan.kewajiban_bayar) }}
              </p>
            </div>


            <div>
              <p class="text-xs text-slate-500">
                Sudah Bayar
              </p>

              <p class="font-semibold">
                {{ formatRupiah(tagihan.sudah_bayar) }}
              </p>
            </div>


            <div>
              <p class="text-xs text-slate-500">
                Kekurangan
              </p>

              <p class="font-semibold">
                {{ formatRupiah(tagihan.kekurangan) }}
              </p>
            </div>

          </div>



          <!-- TRANSAKSI -->
          <div
            v-if="tagihan.transaksi.length"
            class="mt-5 rounded-xl bg-slate-50 p-4"
          >

            <p
              class="mb-3 text-sm font-semibold"
            >
              Riwayat Pembayaran
            </p>


            <div
              class="space-y-2"
            >

              <div
                v-for="trx in tagihan.transaksi"
                :key="trx.id"
                class="flex justify-between text-sm"
              >

                <span>
                  {{
                    trx.transaksi_mahasantri
                      ?.created_at
                      ? new Date(
                          trx.transaksi_mahasantri.created_at
                        ).toLocaleDateString(
                          "id-ID"
                        )
                      : "-"
                  }}
                </span>


                <span
                  class="font-semibold"
                >
                  {{ formatRupiah(trx.jumlah) }}
                </span>

              </div>

            </div>

          </div>


        </div>

      </div>


      <div
        v-else
        class="p-6 text-center text-slate-500"
      >
        Belum ada rincian pembayaran.
      </div>

    </section>


  </div>


  <div
    v-else
    class="rounded-xl border bg-white p-8 text-center text-slate-500"
  >
    Pilih mahasantri untuk melihat detail pembayaran.
  </div>
</template>