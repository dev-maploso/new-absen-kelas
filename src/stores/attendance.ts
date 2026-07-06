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
    // =====================================
    // LOAD
    // =====================================
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
          console.log("📥 LOAD RESPONSE");
          console.log(res.data);
        }
      } finally {
        this.loading = false;
      }
    },

    // =====================================
    // SAVE SEMUA
    // =====================================
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

    // =====================================
    // SAVE SATU
    // =====================================
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

      const res = await AttendanceService.saveOne(payload);

      if (this.debug) {
        console.log("✅ SAVE ONE SUCCESS");
        console.log(res.data);
      }

      this.recalculateStatistics();

      return res.data;
    },

    // =====================================
    // SCAN QR
    // =====================================
    async scanQr(payload: { qr?: string; nim?: string }) {
      const res = await AttendanceService.scanQr({
        kelas_id: this.kelasId,
        tanggal: this.tanggal,
        jam_ke: this.jamKe,
        qr_token: payload.qr,
        nim: payload.nim,
      });

      const result = res.data.data;

      const item = this.items.find(
        (x) => x.registrasi_kelas_id === result.registrasi_kelas_id,
      );

      if (item) {
        item.attendance.id = result.attendance_id;
        item.attendance.status = result.status;
        item.attendance.jam_hadir = result.jam_hadir;
        item.attendance.keterangan = result.keterangan;
      }

      this.recalculateStatistics();

      return result;
    },

    // =====================================
    // HITUNG ULANG STATISTIK
    // =====================================
    recalculateStatistics() {
      this.statistics.total = this.items.length;

      this.statistics.hadir = this.items.filter(
        (x) => x.attendance.status === "hadir",
      ).length;

      this.statistics.izin = this.items.filter(
        (x) => x.attendance.status === "izin",
      ).length;

      this.statistics.sakit = this.items.filter(
        (x) => x.attendance.status === "sakit",
      ).length;

      this.statistics.alpha = this.items.filter(
        (x) => x.attendance.status === "alpha",
      ).length;
    },
  },
});
