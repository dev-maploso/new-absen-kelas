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

function getDeadlineParts(config: AttendanceRestrictionsConfig): {
  hour: number;
  minute: number;
} {
  const [hourPart, minutePart] = config.deadline.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error(`Batas waktu absensi tidak valid: "${config.deadline}"`);
  }

  return { hour, minute };
}

/**
 * True jika waktu sudah melewati batas.
 *
 * Tepat pada deadline (detik ke-0) masih dianggap BELUM lewat. Mulai detik
 * berikutnya (mis. 09:45:01) dianggap sudah lewat.
 */
export function isAttendanceDeadlinePassed(
  date: Date,
  config: AttendanceRestrictionsConfig,
): boolean {
  if (!config.enabled) {
    return false;
  }

  const { hour, minute } = getDeadlineParts(config);
  const deadlineSeconds = hour * 3600 + minute * 60;
  const { hour: currentHour, minute: currentMinute, second: currentSecond } =
    getClockParts(date, config.timezone);

  const currentSeconds =
    currentHour * 3600 + currentMinute * 60 + currentSecond;

  return currentSeconds > deadlineSeconds;
}

/**
 * Keputusan utama: blokir input absensi hanya jika fitur aktif, kelas
 * pengguna termasuk daftar dibatasi, dan batas waktu sudah terlewati.
 */
export function isAttendanceInputBlocked(
  kelas: readonly AttendanceClassLike[] | null | undefined,
  now: Date,
  config: AttendanceRestrictionsConfig,
): boolean {
  if (!config.enabled) {
    return false;
  }

  return (
    isAttendanceRestrictedKelas(kelas, config) &&
    isAttendanceDeadlinePassed(now, config)
  );
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
    isAttendanceInputBlocked(kelas, now, config)
  );
}

/**
 * Label batas waktu untuk tampilan, mis. "09.45".
 */
export function getAttendanceDeadlineLabel(
  config: AttendanceRestrictionsConfig,
): string {
  const { hour, minute } = getDeadlineParts(config);

  return `${String(hour).padStart(2, "0")}.${String(minute).padStart(2, "0")}`;
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
