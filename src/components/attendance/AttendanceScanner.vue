<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, nextTick } from "vue";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "vue-sonner";
import { useAttendanceStore } from "@/stores/attendance";

const attendance = useAttendanceStore();

const scannerId = "attendance-scanner";

const scanner = ref<Html5Qrcode | null>(null);
const scanning = ref(false);

const isProcessing = ref(false);

function isNim(text: string) {
  return /^[0-9]{6,20}$/.test(text);
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

async function onScanSuccess(decodedText: string) {
  if (isProcessing.value) return;

  isProcessing.value = true;
  setTimeout(() => (isProcessing.value = false), 1500);

  try {
    const res = await attendance.scanQr(
      isNim(decodedText)
        ? { nim: decodedText }
        : { qr: decodedText }
    );

      const item = attendance.items.find(
      item => item.registrasi_kelas_id === res.registrasi_kelas_id
    );

    if (item) {
      item.hidden = true;
    }

    toast.success(res.nama, {
      description: `${capitalize(res.status)}${
        res.keterangan ? ` • ${res.keterangan}` : ""
      }`,
      duration: 2500,
    });

  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? "Gagal scan QR");
  }
}

function onScanFailure() {
  // silent
}

async function startScanner() {
  try {
    if (scanning.value) return;

    console.log("📷 INIT SCANNER");

    scanner.value = new Html5Qrcode(scannerId);

    const config = {
      fps: 10,

      // 🔥 FIX RESPONSIVE QR BOX (INI PENTING UNTUK DESKTOP)
      qrbox: (viewWidth: number, viewHeight: number) => {
        const size = Math.floor(Math.min(viewWidth, viewHeight) * 0.7);
        return {
          width: size,
          height: size,
        };
      },
    };

    await scanner.value.start(
      { facingMode: "environment" },
      config,
      onScanSuccess,
      onScanFailure
    );

    scanning.value = true;

    console.log("✅ SCANNER STARTED");
  } catch (err) {
    console.error("❌ SCANNER ERROR:", err);
    toast.error("Gagal mengaktifkan kamera");
  }
}

async function stopScanner() {
  if (!scanner.value) return;

  try {
    if (scanning.value) {
      await scanner.value.stop();
    }
  } catch (e) {
    console.error(e);
  } finally {
    await scanner.value.clear();
    scanner.value = null;
    scanning.value = false;
  }
}

onMounted(async () => {
  await nextTick(); // 🔥 penting biar DOM ready
  await startScanner();
});

onBeforeUnmount(() => {
  stopScanner();
});
</script>

<template>
  <div class="overflow-hidden rounded-2xl border bg-white shadow-sm">
    <!-- HEADER -->
    <div class="border-b px-5 py-4">
      <h2 class="font-semibold text-slate-800">
        Scan QR / NIM
      </h2>
      <p class="mt-1 text-sm text-slate-500">
        Arahkan kamera ke QR atau NIM santri
      </p>
    </div>

    <!-- SCANNER AREA -->
    <div class="p-5">
      <!-- 🔥 FIX UTAMA: height wajib besar di desktop -->
      <div
        :id="scannerId"
        class="w-full min-h-[320px] md:min-h-[420px] lg:min-h-[520px]
               bg-black rounded-xl overflow-hidden
               flex items-center justify-center"
      />

      <!-- STATUS -->
      <div
        class="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
      >
        Kamera aktif dan siap digunakan
      </div>
    </div>
  </div>
</template>