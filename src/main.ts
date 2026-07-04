import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { setupRouterGuards } from "./router/guards";

const app = createApp(App);

const pinia = createPinia();

app.use(pinia);

const { useAuthStore } = await import("@/store/auth");

const auth = useAuthStore();

await auth.restore();

setupRouterGuards(router);

app.use(router);

app.mount("#app");