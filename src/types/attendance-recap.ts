export interface AttendanceRecapItem {
  registrasi_kelas_id: number;

  mahasantri: {
    id: number;
    nama: string;
    kamar: string | null;
  };

  rekap: {
    hadir: number;
    izin: number;
    sakit: number;
    alpha: number;
    total: number;
  };

  detail: AttendanceRecapDetail[];
}

export interface AttendanceRecapDetail {
  tanggal: string;
  jam_ke: number;
  status: "hadir" | "izin" | "sakit" | "alpha";
  status_inisial: string;
  jam_hadir: string | null;
  keterangan: string | null;
}

export interface AttendanceRecapStatistics {
  total_santri: number;
  total_hadir: number;
  total_izin: number;
  total_sakit: number;
  total_alpha: number;
  total_absensi: number;
}

export interface AttendanceRecapMetadata {
  kelas: {
    id: number;
    nama: string;
    kode: string;
  };

  wali_kelas: {
    id: number | null;
    nama: string | null;
  };

  tanggal_mulai: string;
  tanggal_selesai: string;
  jam_ke: number;
}

export interface AttendanceRecapResponse {
  success: boolean;

  metadata: AttendanceRecapMetadata;

  statistics: AttendanceRecapStatistics;

  data: AttendanceRecapItem[];
}