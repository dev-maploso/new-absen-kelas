import test from "node:test";
import assert from "node:assert/strict";

import { ATTENDANCE_RESTRICTIONS } from "../src/config/attendance-restrictions.ts";
import type { AttendanceRestrictionsConfig } from "../src/config/attendance-restrictions.ts";
import {
  formatJakartaDate,
  formatJakartaTime,
  getAttendanceBlockedFromLabel,
  getAttendanceBlockedUntilLabel,
  isAttendanceInputBlocked,
  isAttendanceRestrictedClass,
  isAttendanceRestrictedKelas,
  isWithinAttendanceBlockedWindow,
  normalizeClassName,
  shouldBlockAttendance,
  shouldBlockAttendanceRoute,
} from "../src/helpers/attendance-restrictions.ts";

const FMC_KELAS = [{ nama_kelas: "FM C", kode_kelas: "FMC" }];
const OTHER_KELAS = [{ nama_kelas: "FMA", kode_kelas: "FMA" }];

/**
 * Membuat Date dari jam WIB (UTC+7) pada 19 Oktober 2026.
 * Menggunakan instan UTC agar hasil tidak bergantung timezone mesin test.
 * Ini berfungsi sebagai fake clock: seluruh batas waktu diuji tanpa
 * menunggu waktu nyata.
 */
function jakartaDate(
  hour: number,
  minute: number,
  second = 0,
  day = 19,
): Date {
  return new Date(Date.UTC(2026, 9, day, hour - 7, minute, second));
}

function withConfig(
  overrides: Partial<AttendanceRestrictionsConfig>,
): AttendanceRestrictionsConfig {
  return {
    ...ATTENDANCE_RESTRICTIONS,
    ...overrides,
  };
}

test("normalizeClassName menangani kapitalisasi dan spasi", () => {
  assert.equal(normalizeClassName("FM C"), "FMC");
  assert.equal(normalizeClassName("FMC"), "FMC");
  assert.equal(normalizeClassName("  fm c  "), "FMC");
  assert.equal(normalizeClassName("  Fm  C  "), "FMC");
  assert.equal(normalizeClassName(""), "");
  assert.equal(normalizeClassName(null), "");
  assert.equal(normalizeClassName(undefined), "");
});

test("FM C dan FMC dikenali sebagai kelas yang dibatasi", () => {
  assert.equal(
    isAttendanceRestrictedClass("FM C", ATTENDANCE_RESTRICTIONS),
    true,
  );
  assert.equal(
    isAttendanceRestrictedClass("FMC", ATTENDANCE_RESTRICTIONS),
    true,
  );
  assert.equal(
    isAttendanceRestrictedClass("  fmc  ", ATTENDANCE_RESTRICTIONS),
    true,
  );
  assert.equal(
    isAttendanceRestrictedClass("  Fm C  ", ATTENDANCE_RESTRICTIONS),
    true,
  );
});

test("kelas lain tidak ikut dibatasi (tanpa pencocokan substring)", () => {
  for (const className of [
    "FMA",
    "FMB",
    "FMD",
    "FM C 1",
    "FMC 1",
    "Kelas FMC",
    "F M C X",
  ]) {
    assert.equal(
      isAttendanceRestrictedClass(className, ATTENDANCE_RESTRICTIONS),
      false,
      `${className} seharusnya tidak dibatasi`,
    );
  }
});

test("penambahan kelas pada restrictedClasses langsung dikenali helper", () => {
  const config = withConfig({
    restrictedClasses: [...ATTENDANCE_RESTRICTIONS.restrictedClasses, "FMD"],
  });

  assert.equal(isAttendanceRestrictedClass("FMD", config), true);
  assert.equal(isAttendanceRestrictedClass("  fm d  ", config), true);
  assert.equal(isAttendanceRestrictedClass("FME", config), false);
});

test("enabled: false menonaktifkan seluruh pembatasan", () => {
  const disabled = withConfig({ enabled: false });
  const insideWindow = jakartaDate(10, 0);

  assert.equal(isAttendanceRestrictedClass("FM C", disabled), false);
  assert.equal(isAttendanceRestrictedKelas(FMC_KELAS, disabled), false);
  assert.equal(
    isWithinAttendanceBlockedWindow(insideWindow, disabled),
    false,
  );
  assert.equal(
    shouldBlockAttendance(FMC_KELAS, insideWindow, disabled),
    false,
  );
  assert.equal(
    shouldBlockAttendanceRoute(
      "attendance",
      true,
      FMC_KELAS,
      insideWindow,
      disabled,
    ),
    false,
  );
});

test("kelas pengguna dibaca dari nama_kelas maupun kode_kelas", () => {
  assert.equal(
    isAttendanceRestrictedKelas(
      [{ nama_kelas: "Kelas Lain", kode_kelas: "FMC" }],
      ATTENDANCE_RESTRICTIONS,
    ),
    true,
  );
  assert.equal(
    isAttendanceRestrictedKelas(
      [{ nama_kelas: "fm c", kode_kelas: "LAIN" }],
      ATTENDANCE_RESTRICTIONS,
    ),
    true,
  );
  assert.equal(
    isAttendanceRestrictedKelas(OTHER_KELAS, ATTENDANCE_RESTRICTIONS),
    false,
  );
});

test("batas rentang 09.45–10.30 WIB bersifat inklusif-awal dan eksklusif-akhir", () => {
  const cases: Array<[string, Date, boolean]> = [
    ["09:44:59", jakartaDate(9, 44, 59), false],
    ["09:45:00", jakartaDate(9, 45, 0), true],
    ["09:45:01", jakartaDate(9, 45, 1), true],
    ["10:00:00", jakartaDate(10, 0, 0), true],
    ["10:29:59", jakartaDate(10, 29, 59), true],
    ["10:30:00", jakartaDate(10, 30, 0), false],
    ["10:30:01", jakartaDate(10, 30, 1), false],
    ["10:31:00", jakartaDate(10, 31, 0), false],
  ];

  for (const [label, date, expected] of cases) {
    assert.equal(
      isWithinAttendanceBlockedWindow(date, ATTENDANCE_RESTRICTIONS),
      expected,
      `pukul ${label} seharusnya ${expected ? "ditutup" : "dibuka"}`,
    );
  }
});

test("pemeriksaan rentang menggunakan Asia/Jakarta, bukan jam perangkat", () => {
  // 02:44:59 UTC = 09:44:59 WIB (dibuka)
  assert.equal(
    isWithinAttendanceBlockedWindow(
      new Date("2026-10-19T02:44:59.000Z"),
      ATTENDANCE_RESTRICTIONS,
    ),
    false,
  );

  // 02:45:00 UTC = 09:45:00 WIB (ditutup)
  assert.equal(
    isWithinAttendanceBlockedWindow(
      new Date("2026-10-19T02:45:00.000Z"),
      ATTENDANCE_RESTRICTIONS,
    ),
    true,
  );

  // 03:29:59 UTC = 10:29:59 WIB (ditutup)
  assert.equal(
    isWithinAttendanceBlockedWindow(
      new Date("2026-10-19T03:29:59.000Z"),
      ATTENDANCE_RESTRICTIONS,
    ),
    true,
  );

  // 03:30:00 UTC = 10:30:00 WIB (dibuka kembali)
  assert.equal(
    isWithinAttendanceBlockedWindow(
      new Date("2026-10-19T03:30:00.000Z"),
      ATTENDANCE_RESTRICTIONS,
    ),
    false,
  );

  // 17:00:00 UTC tanggal 19 = 00:00:00 WIB tanggal 20 (di luar rentang)
  assert.equal(
    isWithinAttendanceBlockedWindow(
      new Date("2026-10-19T17:00:00.000Z"),
      ATTENDANCE_RESTRICTIONS,
    ),
    false,
  );
});

test("keputusan gabungan: hanya kelas dibatasi di dalam rentang yang diblokir", () => {
  assert.equal(
    shouldBlockAttendance(FMC_KELAS, jakartaDate(9, 44, 59), ATTENDANCE_RESTRICTIONS),
    false,
  );
  assert.equal(
    shouldBlockAttendance(FMC_KELAS, jakartaDate(9, 45, 0), ATTENDANCE_RESTRICTIONS),
    true,
  );
  assert.equal(
    shouldBlockAttendance(FMC_KELAS, jakartaDate(10, 29, 59), ATTENDANCE_RESTRICTIONS),
    true,
  );
  assert.equal(
    shouldBlockAttendance(FMC_KELAS, jakartaDate(10, 30, 0), ATTENDANCE_RESTRICTIONS),
    false,
  );
  assert.equal(
    shouldBlockAttendance(OTHER_KELAS, jakartaDate(10, 0, 0), ATTENDANCE_RESTRICTIONS),
    false,
  );

  // Alias lama harus mengikuti logika rentang yang baru.
  assert.equal(
    isAttendanceInputBlocked(FMC_KELAS, jakartaDate(10, 0), ATTENDANCE_RESTRICTIONS),
    true,
  );
  assert.equal(
    isAttendanceInputBlocked(FMC_KELAS, jakartaDate(10, 30), ATTENDANCE_RESTRICTIONS),
    false,
  );
});

test("kelas FM C dan FMC terkena aturan, kelas lain tidak", () => {
  const atBlockedTime = jakartaDate(10, 0);

  for (const kelas of [
    [{ nama_kelas: "FM C", kode_kelas: "FMC" }],
    [{ nama_kelas: "FMC", kode_kelas: "FMC" }],
    [{ nama_kelas: "  fm c ", kode_kelas: "fmc" }],
  ]) {
    assert.equal(
      shouldBlockAttendance(kelas, atBlockedTime, ATTENDANCE_RESTRICTIONS),
      true,
    );
  }

  for (const kelas of [
    [{ nama_kelas: "FMA", kode_kelas: "FMA" }],
    [{ nama_kelas: "FMB", kode_kelas: "FMB" }],
    [{ nama_kelas: "FMD", kode_kelas: "FMD" }],
    [{ nama_kelas: "FM C 1", kode_kelas: "FMC1" }],
  ]) {
    assert.equal(
      shouldBlockAttendance(kelas, atBlockedTime, ATTENDANCE_RESTRICTIONS),
      false,
    );
  }
});

test("sesi yang dibuka sebelum pukul 09.45 otomatis ditutup saat rentang dimulai", () => {
  const sameSession = FMC_KELAS;

  assert.equal(
    shouldBlockAttendance(sameSession, jakartaDate(9, 44, 59), ATTENDANCE_RESTRICTIONS),
    false,
  );
  assert.equal(
    shouldBlockAttendance(sameSession, jakartaDate(9, 45, 0), ATTENDANCE_RESTRICTIONS),
    true,
  );
});

test("halaman penutupan mengenali waktu 10.30 sebagai waktu dibuka kembali", () => {
  assert.equal(
    shouldBlockAttendance(FMC_KELAS, jakartaDate(10, 29, 59), ATTENDANCE_RESTRICTIONS),
    true,
  );
  assert.equal(
    shouldBlockAttendance(FMC_KELAS, jakartaDate(10, 30, 0), ATTENDANCE_RESTRICTIONS),
    false,
  );
  assert.equal(
    shouldBlockAttendance(FMC_KELAS, jakartaDate(10, 31, 0), ATTENDANCE_RESTRICTIONS),
    false,
  );
});

test("akses URL absensi langsung dialihkan hanya selama rentang penutupan", () => {
  assert.equal(
    shouldBlockAttendanceRoute(
      "attendance",
      true,
      FMC_KELAS,
      jakartaDate(10, 0),
      ATTENDANCE_RESTRICTIONS,
    ),
    true,
  );

  assert.equal(
    shouldBlockAttendanceRoute(
      "attendance",
      true,
      FMC_KELAS,
      jakartaDate(10, 30),
      ATTENDANCE_RESTRICTIONS,
    ),
    false,
  );

  // Route lain tidak boleh terpengaruh.
  for (const routeName of [
    "login",
    "dashboard",
    "profile",
    "attendance-recap",
    "attendance-closed",
  ]) {
    assert.equal(
      shouldBlockAttendanceRoute(
        routeName,
        true,
        FMC_KELAS,
        jakartaDate(10, 0),
        ATTENDANCE_RESTRICTIONS,
      ),
      false,
      `route ${routeName} tidak boleh dialihkan`,
    );
  }

  assert.equal(
    shouldBlockAttendanceRoute(
      "attendance",
      true,
      OTHER_KELAS,
      jakartaDate(10, 0),
      ATTENDANCE_RESTRICTIONS,
    ),
    false,
  );

  assert.equal(
    shouldBlockAttendanceRoute(
      "attendance",
      false,
      FMC_KELAS,
      jakartaDate(10, 0),
      ATTENDANCE_RESTRICTIONS,
    ),
    false,
  );
});

test("label waktu dan format tanggal/jam mengikuti konfigurasi baru", () => {
  assert.equal(
    getAttendanceBlockedFromLabel(ATTENDANCE_RESTRICTIONS),
    "09.45",
  );
  assert.equal(
    getAttendanceBlockedUntilLabel(ATTENDANCE_RESTRICTIONS),
    "10.30",
  );

  const date = jakartaDate(9, 45, 7);

  assert.equal(
    formatJakartaTime(date, ATTENDANCE_RESTRICTIONS),
    "09:45:07",
  );
  assert.match(
    formatJakartaDate(date, ATTENDANCE_RESTRICTIONS),
    /19 Oktober 2026/,
  );
});
