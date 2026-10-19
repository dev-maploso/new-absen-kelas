/**
 * Konfigurasi terpusat pembatasan waktu input absensi.
 *
 * Untuk menambahkan kelas lain, cukup tambahkan nama/kode kelas pada
 * `restrictedClasses`. Perbandingan dilakukan setelah normalisasi
 * (trim, uppercase, dan tanpa spasi), sehingga "FM C" dan "FMC" setara.
 *
 * Rentang penutupan memakai format HH:mm pada zona `timezone`:
 * - `blockedFrom` inklusif (mulai ditutup)
 * - `blockedUntil` eksklusif (mulai dibuka kembali)
 *
 * Contoh: blockedFrom "09:45" dan blockedUntil "10:30" berarti absensi
 * ditutup pada 09:45:00 sampai 10:29:59, lalu dibuka lagi 10:30:00.
 */
export interface AttendanceRestrictionsConfig {
  restrictedClasses: string[];
  blockedFrom: string;
  blockedUntil: string;
  timezone: string;
  enabled: boolean;
}

export const ATTENDANCE_RESTRICTIONS: AttendanceRestrictionsConfig = {
  restrictedClasses: ["FM C", "FMC"],
  blockedFrom: "09:45",
  blockedUntil: "10:30",
  timezone: "Asia/Jakarta",
  enabled: true,
};
