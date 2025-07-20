import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Register service worker for PWA functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      console.log('SW registered:', registration.scope)
    })
    .catch((error) => {
      console.error('SW registration failed:', error)
    })
}
