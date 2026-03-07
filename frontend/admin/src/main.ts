import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";

// Import the shared API client so its interceptors are registered at startup
import "./lib/api";

import App from "./App.vue";

import "./style.css";

const app = createApp(App);
const pinia = createPinia();

// Configure plugins
app.use(pinia);
app.use(router);

// Mount app
app.mount("#app");
