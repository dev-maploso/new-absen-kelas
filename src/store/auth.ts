import { defineStore } from "pinia";
import AuthService from "@/services/auth.service";

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: localStorage.getItem("token"),
    user: null,
    loading: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,

    isWaliKelas: (state) =>
      state.user?.roles.includes("wali_kelas") ?? false,

    isMimin: (state) =>
      state.user?.roles.includes("mimin") ?? false,
  },

  actions: {
    setToken(token: string) {
      this.token = token;
      localStorage.setItem("token", token);
    },

    setUser(user: User) {
      this.user = user;
    },

    clear() {
      this.token = null;
      this.user = null;

      localStorage.removeItem("token");
    },

    /**
     * Login
     */
    async login(email: string, password: string) {
      this.loading = true;

      try {
        const response = await AuthService.login({
          email,
          password,
        });

        this.setToken(response.data.data.token);

        await this.fetchMe();
      } finally {
        this.loading = false;
      }
    },

    /**
     * Ambil profil user
     */
    async fetchMe() {
      const response = await AuthService.me();

      this.setUser(response.data.data);
    },

    /**
     * Logout
     */
    async logout() {
      try {
        await AuthService.logout();
      } catch {
        // Abaikan jika token sudah tidak valid
      }

      this.clear();
    },

    /**
     * Restore session saat aplikasi pertama kali dibuka
     */
    async restore() {
      if (!this.token) {
        return;
      }

      this.loading = true;

      try {
        await this.fetchMe();
      } catch {
        this.clear();
      } finally {
        this.loading = false;
      }
    },
  },
});