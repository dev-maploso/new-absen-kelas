import type { Router } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export function setupRouterGuards(router: Router) {

    router.beforeEach((to) => {

        const auth = useAuthStore();

        if (to.meta.requiresAuth && !auth.isLoggedIn) {
            return "/login";
        }

        if (to.meta.guest && auth.isLoggedIn) {
            return "/dashboard";
        }

    });

}