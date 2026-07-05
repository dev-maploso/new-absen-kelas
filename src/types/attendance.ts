export type AttendanceStatus = "hadir" | "izin" | "sakit" | "alpha";

export interface AttendanceItem {
  registrasi_kelas_id: number;

  mahasantri: Mahasantri;

  attendance: {
    id: number | null;
    status: AttendanceStatus | null;
    status_inisial: string | null;
    jam_hadir: string | null;
    keterangan: string | null;
  };
}
export interface Mahasantri {
  id: number;
  nama: string;
  kamar: string | null;
}

export interface AttendanceResponse {
  success: boolean;

  metadata: {
    kelas: {
      id: number;
      nama: string;
      kode: string;
    };

    tanggal: string;

    jam_ke: number;

    wali_kelas: {
      id: number;
      nama: string;
    };
  };

  statistics: {
    total: number;
    hadir: number;
    izin: number;
    sakit: number;
    alpha: number;
  };

  data: AttendanceItem[];
}
