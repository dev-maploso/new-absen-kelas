import { defineStore } from "pinia";
import AttendanceService from "@/services/attendance.service";
import type {
  AttendanceRecapItem,
  AttendanceRecapStatistics,
} from "@/types/attendance-recap";
import { getJakartaDate } from "@/helpers/date";

export const useAttendanceRecapStore = defineStore("attendanceRecap", {
  state: () => ({
    items: [] as AttendanceRecapItem[],

    kelasId: null as number | null,

    tanggalMulai: getJakartaDate(),

    tanggalSelesai: getJakartaDate(),

    jamKe: 1,

    loading: false,

    statistics: {
      total_santri: 0,
      total_hadir: 0,
      total_izin: 0,
      total_sakit: 0,
      total_alpha: 0,
      total_absensi: 0,
    } as AttendanceRecapStatistics,

    debug: false,
  }),

  actions: {
    async load() {
      if (!this.kelasId) return;

      this.loading = true;

      try {
        const res = await AttendanceService.recap({
          kelas_id: this.kelasId,
          tanggal_mulai: this.tanggalMulai,
          tanggal_selesai: this.tanggalSelesai,
          jam_ke: this.jamKe,
        });

        this.items = res.data.data;
        this.statistics = res.data.statistics;

        if (this.debug) {
          console.log("📊 RECAP RESPONSE");
          console.log(res.data);
        }
      } finally {
        this.loading = false;
      }
    },

    reset() {
      this.items = [];

      this.statistics = {
        total_santri: 0,
        total_hadir: 0,
        total_izin: 0,
        total_sakit: 0,
        total_alpha: 0,
        total_absensi: 0,
      };

      this.tanggalMulai = getJakartaDate();
      this.tanggalSelesai = getJakartaDate();
      this.jamKe = 1;
    },
  },
});