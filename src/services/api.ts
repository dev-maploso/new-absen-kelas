import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { API } from "@/constants/api";

const api: AxiosInstance = axios.create({
  baseURL: API.BASE_URL,
  timeout: API.TIMEOUT,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Menambahkan Bearer Token secara otomatis.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Response Interceptor
 */
api.interceptors.response.use(
  (response) => response,

  (error: AxiosError<any>) => {
    const status = error.response?.status;

    switch (status) {
      case 401:
        // Token tidak valid / expired
        localStorage.removeItem("token");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        break;

      case 403:
        console.warn("Forbidden (403)");
        break;

      case 404:
        console.warn("Endpoint tidak ditemukan (404)");
        break;

      case 422:
        // Validation Error
        // Biarkan ditangani oleh halaman yang memanggil API.
        break;

      case 500:
        console.error("Internal Server Error (500)");
        break;

      default:
        console.error("Unexpected API Error", error);
        break;
    }

    return Promise.reject(error);
  }
);

export default api;