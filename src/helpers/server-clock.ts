/**
 * Sinkronisasi jam dengan header `Date` dari respons API.
 *
 * Header HTTP Date memiliki presisi detik. Koreksi 500 ms dipakai sebagai
 * perkiraan nilai tengah agar kesalahan tidak selalu berada di satu sisi.
 *
 * Setelah tersinkron, waktu berjalan memakai `performance.now()` (monotonic)
 * agar perubahan jam perangkat tidak langsung menggeser waktu yang dipakai.
 * Jika header tidak tersedia, aplikasi memakai jam perangkat sebagai fallback.
 */
let serverSynced = false;
let syncedServerMs = 0;
let syncedPerformanceMs = 0;

export function syncServerClock(
  dateHeader: string | null | undefined,
  requestStartedAt?: number,
): void {
  if (!dateHeader) {
    return;
  }

  const serverTimestamp = Date.parse(dateHeader);

  if (!Number.isFinite(serverTimestamp)) {
    return;
  }

  const receivedAt = Date.now();
  const receivedPerformance = performance.now();

  const reference = requestStartedAt
    ? requestStartedAt + (receivedAt - requestStartedAt) / 2
    : receivedAt;

  // Perkiraan waktu server pada saat respons diterima.
  syncedServerMs =
    serverTimestamp + 500 + Math.max(0, receivedAt - reference);
  syncedPerformanceMs = receivedPerformance;
  serverSynced = true;
}

/**
 * Waktu sekarang yang sudah dikoreksi dengan jam server (jika tersedia).
 */
export function getTrustedNow(): Date {
  if (!serverSynced) {
    return new Date();
  }

  const elapsedMs = performance.now() - syncedPerformanceMs;

  return new Date(syncedServerMs + elapsedMs);
}

export function isServerClockSynced(): boolean {
  return serverSynced;
}
