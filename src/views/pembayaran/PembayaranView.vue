<script setup lang="ts">

import { usePembayaranStore } from "@/stores/pembayaran";

import PembayaranSearch from "@/components/pembayaran/PembayaranSearch.vue";
import PembayaranDetail from "@/components/pembayaran/PembayaranDetail.vue";


const pembayaran = usePembayaranStore();



async function selectMahasantri(id:number) {

    await pembayaran.selectMahasantri(id);

}


</script>


<template>

<div class="space-y-6">


    <!-- Header -->
    <div>
        <h1 class="text-2xl font-bold text-slate-800">
            Pembayaran Mahasantri
        </h1>

        <p class="text-sm text-slate-500">
            Cari mahasantri untuk melihat detail pembayaran
        </p>
    </div>



    <!-- Search -->
    <PembayaranSearch
        @select="selectMahasantri"
    />



    <!-- Loading detail -->
    <div
        v-if="pembayaran.loadingDetail"
        class="rounded-xl bg-white p-6 text-center shadow"
    >
        Memuat detail pembayaran...
    </div>



    <!-- Detail -->
    <PembayaranDetail
        v-else-if="pembayaran.detail"
    />



    <!-- Empty -->
    <div
        v-else
        class="rounded-xl bg-white p-6 text-center text-slate-500 shadow"
    >
        Silahkan cari nama mahasantri
    </div>



</div>

</template>