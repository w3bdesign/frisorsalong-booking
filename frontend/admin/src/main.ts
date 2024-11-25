import { createApp } from "vue";
import { createPinia } from "pinia";
import axios from "axios";
import router from "./router";
import { useAuthStore } from "./stores/auth";

import App from "./App.vue";

import "./style.css";

const app = createApp(App);
const pinia = createPinia();

// Configure plugins
app.use(pinia);
app.use(router);

// Add axios response interceptor for session expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message === "Økt utløpt. Vennligst logg inn igjen." ||
        error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

// Mount app
app.mount("#app");
