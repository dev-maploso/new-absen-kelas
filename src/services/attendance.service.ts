import api from "./api";
import type { AttendanceResponse } from "@/types/attendance";

export default {
  index(params: { kelas_id: number; tanggal: string; jam_ke: number }) {
    return api.get<AttendanceResponse>("/wali-kelas/attendances", {
      params,
    });
  },

  store(data: any) {
    return api.post("/wali-kelas/attendances", data);
  },
  saveOne(data: any) {
    return api.post("/wali-kelas/attendances/save-one", data);
  },
};
