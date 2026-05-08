import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Create the app instance
const app = createApp(App)

// Use plugins
const pinia = createPinia()
// Pinia's install() method is fully compatible with Vue's plugin system
app.use(pinia as unknown as Parameters<typeof app.use>[0])
app.use(router)

// Mount the app
app.mount('#app')
