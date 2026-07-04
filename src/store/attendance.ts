import { defineStore } from "pinia";

export const useAttendanceStore = defineStore("attendance", {

    state: () => ({

        items: [],

        loading: false,

    }),

});