<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAttendanceStore } from "@/stores/attendance";
import { useAuthStore } from "@/stores/auth";

import AttendanceFilter from "@/components/attendance/AttendanceFilter.vue";
import AttendanceStatistics from "@/components/attendance/AttendanceStatistics.vue";
import AttendanceTable from "@/components/attendance/AttendanceTable.vue";
import AttendanceActions from "@/components/attendance/AttendanceActions.vue";
import AttendanceEmpty from "@/components/attendance/AttendanceEmpty.vue";
import AttendanceScanner from "@/components/attendance/AttendanceScanner.vue";

const attendance = useAttendanceStore();
const auth = useAuthStore();

const loaded = ref(false);

const kelas = computed(() => auth.kelas);

onMounted(() => {
    if (kelas.value.length) {
        attendance.kelasId = kelas.value[0].id;
    }
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
    <AttendanceFilter :kelas="kelas" @load="loadAttendance" />

    <AttendanceEmpty v-if="!loaded" />

    <template v-else>
        <AttendanceScanner />
        
        <AttendanceStatistics />

        <AttendanceTable />



        <AttendanceActions />
    </template>
</template>