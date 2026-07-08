import type { AttendanceRecapResponse } from "@/types/attendance-recap";
import api from "./api";
import type { AttendanceResponse } from "@/types/attendance";

export default {
  index(params: { kelas_id: number; tanggal: string; jam_ke: number }) {
    return api.get<AttendanceResponse>("/wali-kelas/attendances", {
      params,
    });
  },

  recap(params: {
    kelas_id: number;
    tanggal_mulai: string;
    tanggal_selesai: string;
    jam_ke: number;
  }) {
    return api.get<AttendanceRecapResponse>(
      "/wali-kelas/attendances/recap",
      {
        params,
      },
    );
  },

  store(data: any) {
    return api.post("/wali-kelas/attendances", data);
  },
  saveOne(data: any) {
    return api.post("/wali-kelas/attendances/save-one", data);
  },
  scanQr(data: {
    kelas_id: number | null;
    tanggal: string;
    jam_ke: number;
    qr_token?: string;
    nim?: string;
  }) {
    return api.post("/wali-kelas/attendances/scan-qr", data);
  },
};
