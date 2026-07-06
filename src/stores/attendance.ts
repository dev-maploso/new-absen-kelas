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

    debug: false,
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

    // ===========================
    // SAVE SEMUA
    // ===========================
    async save() {
      const payload = {
        kelas_id: this.kelasId,
        tanggal: this.tanggal,
        jam_ke: this.jamKe,

        attendances: this.items.map((item) => ({
          registrasi_kelas_id: item.registrasi_kelas_id,
          status: item.attendance.status,
          jam_hadir: item.attendance.jam_hadir
            ? item.attendance.jam_hadir.slice(0, 5)
            : null,
          keterangan: item.attendance.keterangan,
        })),
      };

      if (this.debug) {
        console.log("🚀 SAVE ALL");
        console.log(payload);
      }

      return AttendanceService.store(payload);
    },

    // ===========================
    // SAVE SATU SANTRI (AUTOSAVE)
    // ===========================
    async saveOne(item: AttendanceItem) {
      const payload = {
        kelas_id: this.kelasId,
        tanggal: this.tanggal,
        jam_ke: this.jamKe,

        registrasi_kelas_id: item.registrasi_kelas_id,
        status: item.attendance.status,
        jam_hadir: item.attendance.jam_hadir
          ? item.attendance.jam_hadir.slice(0, 5)
          : null,
        keterangan: item.attendance.keterangan,
      };

      if (this.debug) {
        console.log("🚀 SAVE ONE");
        console.log(payload);
      }

      try {
        const res = await AttendanceService.saveOne(payload);

        if (this.debug) {
          console.log("✅ SAVE ONE SUCCESS");
          console.log(res.data);
        }

        return res.data;
      } catch (err: any) {
        console.error("❌ SAVE ONE ERROR");
        console.log(err.response?.data);

        throw err;
      }
    },
  },
});