import { defineStore } from "pinia";
import AttendanceService from "@/services/attendance.service";
import type { AttendanceItem } from "@/types/attendance";
import { getJakartaDate } from "@/helpers/date";

type ScanQrResult = {
  registrasi_kelas_id: number;
  nama: string;
  status: "hadir" | "izin" | "sakit" | "alpha";
  jam_hadir: string | null;
  keterangan: string | null;
  attendance_id: number;
};

export const useAttendanceStore = defineStore("attendance", {
  state: () => ({
    items: [] as AttendanceItem[],

    kelasId: null as number | null,

    tanggal: getJakartaDate(),

    // filter jam aktif
    jamKe: 1,

    // jam yang dipakai saat scan QR izin
    selectedJamKe: [1] as number[],

    loading: false,

    statistics: {
      total: 0,
      hadir: 0,
      izin: 0,
      sakit: 0,
      alpha: 0,
    },

    debug: false,

    quickFilter: "all" as
      | "all"
      | "empty"
      | "hadir"
      | "izin"
      | "sakit"
      | "alpha",
  }),

  getters: {
    filteredItems(state) {
      switch (state.quickFilter) {
        case "empty":
          return state.items.filter((item) => !item.attendance.status);

        case "hadir":
          return state.items.filter(
            (item) => item.attendance.status === "hadir",
          );

        case "izin":
          return state.items.filter(
            (item) => item.attendance.status === "izin",
          );

        case "sakit":
          return state.items.filter(
            (item) => item.attendance.status === "sakit",
          );

        case "alpha":
          return state.items.filter(
            (item) => item.attendance.status === "alpha",
          );

        default:
          return state.items;
      }
    },
  },

  actions: {
    // =====================================
    // SET JAM FILTER
    // =====================================
    setJamKe(jam: number) {
      this.jamKe = jam;

      // otomatis pilih jam tersebut
      if (!this.selectedJamKe.includes(jam)) {
        this.selectedJamKe = [jam];
      }
    },

    // =====================================
    // TOGGLE CHECKBOX JAM IZIN
    // =====================================
    toggleJamKe(jam: number) {
      if (this.selectedJamKe.includes(jam)) {
        this.selectedJamKe = this.selectedJamKe.filter((x) => x !== jam);
      } else {
        this.selectedJamKe.push(jam);
      }
    },

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

      const res = await AttendanceService.saveOne(payload);

      this.recalculateStatistics();

      return res.data;
    },

    // =====================================
    // SCAN QR / NIM
    // =====================================
    async scanQr(payload: {
      qr?: string;
      nim?: string;
      jam_ke_list?: number[];
    }) {
      let result: ScanQrResult | null = null;

      const jamList = payload.jam_ke_list ?? [this.jamKe];

      for (const jam of jamList) {
        const res = await AttendanceService.scanQr({
          kelas_id: this.kelasId,

          tanggal: this.tanggal,

          jam_ke: jam,

          qr_token: payload.qr,

          nim: payload.nim,
        });

        result = res.data.data;

        const item = this.items.find(
          (x) => x.registrasi_kelas_id === result!.registrasi_kelas_id,
        );

        if (item) {
          item.attendance.id = result!.attendance_id;

          item.attendance.status = result!.status;

          item.attendance.jam_hadir = result!.jam_hadir;

          item.attendance.keterangan = result!.keterangan;
        }
      }

      this.recalculateStatistics();

      if (!result) {
        throw new Error("Scan gagal");
      }

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
