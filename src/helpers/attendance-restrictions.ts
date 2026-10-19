import type { AttendanceRestrictionsConfig } from "../config/attendance-restrictions";

export interface AttendanceClassLike {
  nama_kelas?: string | null;
  kode_kelas?: string | null;
}

interface ClockParts {
  hour: number;
  minute: number;
  second: number;
}

const clockFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * Normalisasi identitas kelas agar perbedaan kapitalisasi dan spasi tidak
 * membuat kelas yang sama dianggap berbeda.
 *
 * Contoh: "  fm c " -> "FMC", "FMC" -> "FMC".
 */
export function normalizeClassName(
  className: string | null | undefined,
): string {
  return (className ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * Mengecek apakah satu nama/kode kelas termasuk daftar yang dibatasi.
 * Perbandingan memakai identitas penuh setelah normalisasi, bukan substring.
 */
export function isAttendanceRestrictedClass(
  className: string | null | undefined,
  config: AttendanceRestrictionsConfig,
): boolean {
  if (!config.enabled) {
    return false;
  }

  const normalized = normalizeClassName(className);

  if (!normalized) {
    return false;
  }

  return config.restrictedClasses.some(
    (restrictedClass) => normalizeClassName(restrictedClass) === normalized,
  );
}

/**
 * Mengecek seluruh kelas milik pengguna. Kelas dianggap dibatasi jika salah
 * satu `nama_kelas` atau `kode_kelas` cocok dengan konfigurasi.
 */
export function isAttendanceRestrictedKelas(
  kelas: readonly AttendanceClassLike[] | null | undefined,
  config: AttendanceRestrictionsConfig,
): boolean {
  if (!config.enabled) {
    return false;
  }

  return (kelas ?? []).some(
    (item) =>
      isAttendanceRestrictedClass(item?.nama_kelas, config) ||
      isAttendanceRestrictedClass(item?.kode_kelas, config),
  );
}

function getClockFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = clockFormatters.get(timeZone);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  clockFormatters.set(timeZone, formatter);

  return formatter;
}

function getClockParts(date: Date, timeZone: string): ClockParts {
  const parts = getClockFormatter(timeZone).formatToParts(date);

  let hour = 0;
  let minute = 0;
  let second = 0;

  for (const part of parts) {
    if (part.type === "hour") {
      // Sebagian implementasi mengembalikan "24" untuk tengah malam.
      hour = Number(part.value) % 24;
    } else if (part.type === "minute") {
      minute = Number(part.value);
    } else if (part.type === "second") {
      second = Number(part.value);
    }
  }

  return { hour, minute, second };
}

/**
 * Mengubah konfigurasi waktu "HH:mm" menjadi detik sejak tengah malam.
 * Nilai divalidasi agar kesalahan konfigurasi cepat terdeteksi.
 */
function parseTimeOfDay(value: string, fieldName: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());

  if (!match) {
    throw new Error(
      `Konfigurasi ${fieldName} tidak valid: "${value}" (gunakan HH:mm)`,
    );
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error(
      `Konfigurasi ${fieldName} tidak valid: "${value}" (gunakan HH:mm)`,
    );
  }

  return hour * 3600 + minute * 60;
}

function getClockSeconds(date: Date, timeZone: string): number {
  const { hour, minute, second } = getClockParts(date, timeZone);

  return hour * 3600 + minute * 60 + second;
}

/**
 * True jika waktu berada di dalam rentang penutupan.
 *
 * `blockedFrom` inklusif dan `blockedUntil` eksklusif. Dengan konfigurasi
 * 09:45–10:30, waktu 09:45:00 sampai 10:29:59 ditutup, sedangkan 10:30:00
 * sudah dibuka kembali. Perbandingan memakai zona waktu konfigurasi, bukan
 * zona waktu perangkat.
 */
export function isWithinAttendanceBlockedWindow(
  date: Date,
  config: AttendanceRestrictionsConfig,
): boolean {
  if (!config.enabled) {
    return false;
  }

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return false;
  }

  const blockedFrom = parseTimeOfDay(config.blockedFrom, "blockedFrom");
  const blockedUntil = parseTimeOfDay(config.blockedUntil, "blockedUntil");

  // Rentang kosong (mis. 10:30–10:30) dianggap tidak pernah menutup absensi.
  if (blockedFrom === blockedUntil) {
    return false;
  }

  const current = getClockSeconds(date, config.timezone);

  // Mendukung rentang yang melewati tengah malam, meskipun konfigurasi saat
  // ini tidak memakainya.
  if (blockedFrom < blockedUntil) {
    return current >= blockedFrom && current < blockedUntil;
  }

  return current >= blockedFrom || current < blockedUntil;
}

/**
 * Keputusan utama: blokir input absensi hanya jika fitur aktif, kelas
 * pengguna termasuk daftar dibatasi, dan waktu sekarang berada di dalam
 * rentang penutupan.
 */
export function shouldBlockAttendance(
  kelas: readonly AttendanceClassLike[] | null | undefined,
  now: Date,
  config: AttendanceRestrictionsConfig,
): boolean {
  if (!config.enabled) {
    return false;
  }

  return (
    isAttendanceRestrictedKelas(kelas, config) &&
    isWithinAttendanceBlockedWindow(now, config)
  );
}

/**
 * Nama lama untuk `shouldBlockAttendance`, dipertahankan agar pemanggil
 * lama tidak rusak. Logikanya kini mengikuti rentang waktu, bukan deadline
 * permanen.
 */
export function isAttendanceInputBlocked(
  kelas: readonly AttendanceClassLike[] | null | undefined,
  now: Date,
  config: AttendanceRestrictionsConfig,
): boolean {
  return shouldBlockAttendance(kelas, now, config);
}

/**
 * Keputusan routing: hanya route input absensi yang boleh dialihkan ke
 * halaman penutupan. Route lain (login, dashboard, profil, rekap, dll.)
 * tidak terpengaruh.
 */
export function shouldBlockAttendanceRoute(
  routeName: string | symbol | null | undefined,
  isLoggedIn: boolean,
  kelas: readonly AttendanceClassLike[] | null | undefined,
  now: Date,
  config: AttendanceRestrictionsConfig,
): boolean {
  return (
    routeName === "attendance" &&
    isLoggedIn &&
    shouldBlockAttendance(kelas, now, config)
  );
}

function formatTimeOfDayLabel(value: string, fieldName: string): string {
  const seconds = parseTimeOfDay(value, fieldName);
  const hour = Math.floor(seconds / 3600);
  const minute = Math.floor((seconds % 3600) / 60);

  return `${String(hour).padStart(2, "0")}.${String(minute).padStart(2, "0")}`;
}

/**
 * Label waktu mulai penutupan untuk tampilan, mis. "09.45".
 */
export function getAttendanceBlockedFromLabel(
  config: AttendanceRestrictionsConfig,
): string {
  return formatTimeOfDayLabel(config.blockedFrom, "blockedFrom");
}

/**
 * Label waktu absensi dibuka kembali untuk tampilan, mis. "10.30".
 */
export function getAttendanceBlockedUntilLabel(
  config: AttendanceRestrictionsConfig,
): string {
  return formatTimeOfDayLabel(config.blockedUntil, "blockedUntil");
}

/**
 * Tanggal saat ini menurut zona waktu konfigurasi.
 */
export function formatJakartaDate(
  date: Date,
  config: AttendanceRestrictionsConfig,
): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: config.timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Jam saat ini (HH:mm:ss) menurut zona waktu konfigurasi.
 */
export function formatJakartaTime(
  date: Date,
  config: AttendanceRestrictionsConfig,
): string {
  const { hour, minute, second } = getClockParts(date, config.timezone);

  return [hour, minute, second]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}
