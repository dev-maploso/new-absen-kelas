import api from "./api";

export default {

    login(data: {

        email: string;

        password: string;

    }) {

        return api.post("/login", data);

    },

    me() {

        return api.get("/me");

    },

    logout() {

        return api.post("/logout");

    },

    logoutAll() {

        return api.post("/logout-all");

    },

};