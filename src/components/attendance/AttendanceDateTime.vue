<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const now = ref(new Date());

let timer: number;

onMounted(() => {
    timer = window.setInterval(() => {
        now.value = new Date();
    }, 1000);
});

onBeforeUnmount(() => {
    clearInterval(timer);
});

const hari = () =>
    new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
    }).format(now.value);

const tanggal = () =>
    new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(now.value);

const jam = () =>
    new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).format(now.value);
</script>

<template>
    <div
        class="rounded-xl border bg-white dark:bg-gray-900 px-5 py-4 shadow-sm"
    >
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ hari() }}
                </h2>

                <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ tanggal() }}
                </p>
            </div>

            <div
                class="mt-3 md:mt-0 text-3xl font-bold tracking-wider text-primary"
            >
                {{ jam() }}
            </div>
        </div>
    </div>
</template>