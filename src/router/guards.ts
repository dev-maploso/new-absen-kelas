import type { Router } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { ATTENDANCE_RESTRICTIONS } from "@/config/attendance-restrictions";
import { shouldBlockAttendanceRoute } from "@/helpers/attendance-restrictions";
import { getTrustedNow } from "@/helpers/server-clock";

export function setupRouterGuards(router: Router) {
  router.beforeEach((to) => {
    const auth = useAuthStore();

    if (to.meta.requiresAuth && !auth.isLoggedIn) {
      return { name: "login" };
    }

    if (to.meta.guest && auth.isLoggedIn) {
      return { name: "dashboard" };
    }

    /**
     * Berlaku juga untuk akses URL langsung karena guard berjalan pada
     * setiap navigasi menuju route absensi.
     */
    if (
      shouldBlockAttendanceRoute(
        to.name,
        auth.isLoggedIn,
        auth.kelas,
        getTrustedNow(),
        ATTENDANCE_RESTRICTIONS,
      )
    ) {
      return { name: "attendance-closed" };
    }

    return true;
  });
}