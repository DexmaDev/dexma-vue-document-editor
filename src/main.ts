import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import VueSafeHTML from 'vue-safe-html'

const app = createApp(App, {
    devtools: true,
})

app.use(VueSafeHTML)

app.mount('#app')
