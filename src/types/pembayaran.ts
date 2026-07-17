export interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

/**
 * Search
 */
export interface PembayaranSearchItem {
  id: number;
  mahasantri_id: number;

  name: string;
  nim: string;

  status: string;
  kekurangan: number;
}

/**
 * Mahasantri
 */
export interface PembayaranMahasantriInfo {
  id: number;
  name: string;
  nim: string;
}

/**
 * Tahun Ajaran
 */
export interface TahunAjaranInfo {
  id: number;
  nama: string;
}

export interface KelasInfo {
  id: number;
  nama: string;
}

/**
 * Jenis Pembayaran
 */
export interface JenisPembayaran {
  id: number;
  kode: string;
  nama: string;
  diskon: number;
  sekali_bayar: boolean;
}

/**
 * Pembayaran
 */
export interface PembayaranInfo {
  id: number;
  total_bayar: number;

  jenis_pembayaran: JenisPembayaran | null;
}

/**
 * Transaksi Mahasantri
 */
export interface TransaksiMahasantriInfo {
  id: number;

  created_at: string | null;
  updated_at: string | null;
}

/**
 * Riwayat transaksi
 */
export interface RiwayatTransaksi {
  id: number;

  jumlah: number;

  transaksi_mahasantri: TransaksiMahasantriInfo | null;
}

/**
 * Tagihan
 */
export interface TagihanMahasantri {
  id: number;

  kewajiban_bayar: number;
  sudah_bayar: number;
  kekurangan: number;

  status: string;

  pembayaran: PembayaranInfo | null;

  transaksi: RiwayatTransaksi[];
}

/**
 * Pembayaran Mahasantri
 */
export interface PembayaranMahasantri {
  id: number;

  mahasantri_id: number;
  tahun_ajaran_id: number;

  kewajiban_bayar: number;
  sudah_bayar: number;
  kekurangan: number;

  status: string;
  status_label: string;

  sudah_bayar_uang_gedung: boolean;

  mahasantri: PembayaranMahasantriInfo | null;
  tahun_ajaran: TahunAjaranInfo | null;
  kelas: KelasInfo | null;


  tagihan?: TagihanMahasantri[];

  created_at: string;
  updated_at: string;
}

/**
 * Summary
 */
export interface PembayaranSummary {
  total_data: number;

  total_kewajiban: number;
  total_sudah_bayar: number;
  total_kekurangan: number;

  lunas: number;
  belum_lunas: number;
}