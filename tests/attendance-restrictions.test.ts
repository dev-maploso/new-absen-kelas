import test from "node:test";
import assert from "node:assert/strict";

import { ATTENDANCE_RESTRICTIONS } from "../src/config/attendance-restrictions.ts";
import type { AttendanceRestrictionsConfig } from "../src/config/attendance-restrictions.ts";
import {
  formatJakartaDate,
  formatJakartaTime,
  getAttendanceDeadlineLabel,
  isAttendanceDeadlinePassed,
  isAttendanceInputBlocked,
  isAttendanceRestrictedClass,
  isAttendanceRestrictedKelas,
  normalizeClassName,
  shouldBlockAttendanceRoute,
} from "../src/helpers/attendance-restrictions.ts";

const FMC_KELAS = [{ nama_kelas: "FM C", kode_kelas: "FMC" }];
const OTHER_KELAS = [{ nama_kelas: "FMA", kode_kelas: "FMA" }];

/**
 * Membuat Date dari jam WIB (UTC+7) pada 19 Oktober 2026.
 * Menggunakan instan UTC agar hasil tidak bergantung timezone mesin test.
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
  const afterDeadline = jakartaDate(9, 46);

  assert.equal(isAttendanceRestrictedClass("FM C", disabled), false);
  assert.equal(isAttendanceRestrictedKelas(FMC_KELAS, disabled), false);
  assert.equal(
    isAttendanceDeadlinePassed(afterDeadline, disabled),
    false,
  );
  assert.equal(
    isAttendanceInputBlocked(FMC_KELAS, afterDeadline, disabled),
    false,
  );
  assert.equal(
    shouldBlockAttendanceRoute(
      "attendance",
      true,
      FMC_KELAS,
      afterDeadline,
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

test("deadline 09:45 WIB: 09:44 boleh, 09:45:00 boleh, 09:45:01 ditolak", () => {
  assert.equal(
    isAttendanceDeadlinePassed(jakartaDate(9, 44, 59), ATTENDANCE_RESTRICTIONS),
    false,
  );
  assert.equal(
    isAttendanceDeadlinePassed(jakartaDate(9, 45, 0), ATTENDANCE_RESTRICTIONS),
    false,
  );
  assert.equal(
    isAttendanceDeadlinePassed(jakartaDate(9, 45, 1), ATTENDANCE_RESTRICTIONS),
    true,
  );
  assert.equal(
    isAttendanceDeadlinePassed(jakartaDate(9, 46, 0), ATTENDANCE_RESTRICTIONS),
    true,
  );
});

test("pemeriksaan deadline menggunakan Asia/Jakarta, bukan jam perangkat", () => {
  // 02:45:00 UTC = 09:45:00 WIB
  assert.equal(
    isAttendanceDeadlinePassed(
      new Date("2026-10-19T02:45:00.000Z"),
      ATTENDANCE_RESTRICTIONS,
    ),
    false,
  );

  // 02:45:01 UTC = 09:45:01 WIB
  assert.equal(
    isAttendanceDeadlinePassed(
      new Date("2026-10-19T02:45:01.000Z"),
      ATTENDANCE_RESTRICTIONS,
    ),
    true,
  );

  // 17:00:00 UTC tanggal 19 = 00:00:00 WIB tanggal 20 (belum lewat)
  assert.equal(
    isAttendanceDeadlinePassed(
      new Date("2026-10-19T17:00:00.000Z"),
      ATTENDANCE_RESTRICTIONS,
    ),
    false,
  );

  // 16:45:01 UTC tanggal 19 = 23:45:01 WIB (sudah lewat)
  assert.equal(
    isAttendanceDeadlinePassed(
      new Date("2026-10-19T16:45:01.000Z"),
      ATTENDANCE_RESTRICTIONS,
    ),
    true,
  );
});

test("keputusan gabungan: hanya kelas dibatasi setelah deadline yang diblokir", () => {
  assert.equal(
    isAttendanceInputBlocked(FMC_KELAS, jakartaDate(9, 44), ATTENDANCE_RESTRICTIONS),
    false,
  );
  assert.equal(
    isAttendanceInputBlocked(
      FMC_KELAS,
      jakartaDate(9, 45, 0),
      ATTENDANCE_RESTRICTIONS,
    ),
    false,
  );
  assert.equal(
    isAttendanceInputBlocked(
      FMC_KELAS,
      jakartaDate(9, 45, 1),
      ATTENDANCE_RESTRICTIONS,
    ),
    true,
  );
  assert.equal(
    isAttendanceInputBlocked(
      OTHER_KELAS,
      jakartaDate(9, 46),
      ATTENDANCE_RESTRICTIONS,
    ),
    false,
  );
});

test("sesi yang dibuka sebelum deadline kehilangan akses setelah deadline", () => {
  const sameSession = FMC_KELAS;

  assert.equal(
    isAttendanceInputBlocked(
      sameSession,
      jakartaDate(9, 30),
      ATTENDANCE_RESTRICTIONS,
    ),
    false,
  );
  assert.equal(
    isAttendanceInputBlocked(
      sameSession,
      jakartaDate(9, 45, 1),
      ATTENDANCE_RESTRICTIONS,
    ),
    true,
  );
});

test("akses URL absensi langsung dialihkan, route lain tidak", () => {
  const afterDeadline = jakartaDate(9, 46);

  assert.equal(
    shouldBlockAttendanceRoute(
      "attendance",
      true,
      FMC_KELAS,
      afterDeadline,
      ATTENDANCE_RESTRICTIONS,
    ),
    true,
  );

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
        afterDeadline,
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
      afterDeadline,
      ATTENDANCE_RESTRICTIONS,
    ),
    false,
  );

  assert.equal(
    shouldBlockAttendanceRoute(
      "attendance",
      false,
      FMC_KELAS,
      afterDeadline,
      ATTENDANCE_RESTRICTIONS,
    ),
    false,
  );
});

test("label deadline dan format tanggal/jam mengikuti konfigurasi", () => {
  assert.equal(
    getAttendanceDeadlineLabel(ATTENDANCE_RESTRICTIONS),
    "09.45",
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
