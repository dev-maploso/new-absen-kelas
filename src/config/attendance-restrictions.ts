/**
 * Konfigurasi terpusat pembatasan waktu input absensi.
 *
 * Untuk menambahkan kelas lain, cukup tambahkan nama/kode kelas pada
 * `restrictedClasses`. Perbandingan dilakukan setelah normalisasi
 * (trim, uppercase, dan tanpa spasi), sehingga "FM C" dan "FMC" setara.
 */
export interface AttendanceRestrictionsConfig {
  restrictedClasses: string[];
  deadline: string;
  timezone: string;
  enabled: boolean;
}

export const ATTENDANCE_RESTRICTIONS: AttendanceRestrictionsConfig = {
  restrictedClasses: ["FM C", "FMC"],
  deadline: "09:45",
  timezone: "Asia/Jakarta",
  enabled: true,
};
