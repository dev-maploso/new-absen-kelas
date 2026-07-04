import { defineStore } from "pinia";

export const useLayoutStore = defineStore("layout", {
    state: () => ({
        sidebarOpen: false,
        sidebarCollapsed: false,
    }),

    actions: {
        toggleSidebar() {
            this.sidebarOpen = !this.sidebarOpen;
        },

        closeSidebar() {
            this.sidebarOpen = false;
        },

        toggleCollapse() {
            this.sidebarCollapsed = !this.sidebarCollapsed;
        },
    },
});