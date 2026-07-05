import { defineStore } from "pinia";
import AttendanceService from "@/services/attendance.service";
import type { AttendanceItem } from "@/types/attendance";

export const useAttendanceStore = defineStore("attendance", {
  state: () => ({
    items: [] as AttendanceItem[],

    kelasId: null as number | null,

    tanggal: new Date().toISOString().slice(0, 10),

    jamKe: 1,

    loading: false,

    statistics: {
      total: 0,
      hadir: 0,
      izin: 0,
      sakit: 0,
      alpha: 0,
    },

    debug: false, // 🔥 ENABLE DEBUG
  }),

  actions: {
    async load() {
      if (!this.kelasId) return;

      this.loading = true;

      try {
        const res = await AttendanceService.index({
          kelas_id: this.kelasId,
          tanggal: this.tanggal,
          jam_ke: this.jamKe,
        });

        this.items = res.data.data;
        this.statistics = res.data.statistics;

        if (this.debug) {
          console.log("📥 LOAD RESPONSE:", res.data);
        }
      } finally {
        this.loading = false;
      }
    },

    async save() {
      const payload = {
        kelas_id: this.kelasId,
        tanggal: this.tanggal,
        jam_ke: this.jamKe,

        attendances: this.items.map((item) => {
          let jam = item.attendance.jam_hadir;

          // 🔥 FORCE FORMAT H:i
          if (typeof jam === "string") {
            jam = jam.slice(0, 5);
          }

          const data = {
            registrasi_kelas_id: item.registrasi_kelas_id,
            status: item.attendance.status,
            jam_hadir: jam,
            keterangan: item.attendance.keterangan,
          };

          return data;
        }),
      };

      if (this.debug) {
        console.log("🚀 PAYLOAD KIRIM KE BACKEND:");
        console.log(JSON.stringify(payload, null, 2));
      }

      try {
        const res = await AttendanceService.store(payload);

        if (this.debug) {
          console.log("✅ SAVE SUCCESS:", res.data);
        }

        return res.data;
      } catch (err: any) {
        console.error("🔥 ERROR RESPONSE FULL:");

        console.log("STATUS:", err?.response?.status);
        console.log("DATA:", err?.response?.data);

        throw err;
      }
    },
  },
});