import api from "./api";

export interface PembayaranParams {
  page?: number;
  per_page?: number;

  keyword?: string;
  status?: string;

  mahasantri_id?: number;
  tahun_ajaran_id?: number;

  sort_by?: string;
  sort_direction?: "asc" | "desc";

  include?: "detail";
}

export interface PembayaranSearchParams {
  keyword: string;
  tahun_ajaran_id?: number;
  status?: string;
  limit?: number;
}

export default {
  /**
   * List pembayaran
   */
  list(params?: PembayaranParams) {
    return api.get("/wali-kelas/pembayaran-mahasantri", {
      params,
    });
  },

  /**
   * Search mahasantri
   */
  search(params: PembayaranSearchParams) {
    return api.get("/wali-kelas/pembayaran-mahasantri/search", {
      params,
    });
  },

  /**
   * Detail pembayaran
   */
  detail(id: number) {
    return api.get(`/wali-kelas/pembayaran-mahasantri/${id}`);
  },

  /**
   * Ringkasan pembayaran
   */
  summary(params?: Omit<PembayaranParams, "page" | "per_page">) {
    return api.get("/wali-kelas/pembayaran-mahasantri/summary", {
      params,
    });
  },
};