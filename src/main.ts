import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// import router from './router'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import Dialog from 'primevue/dialog';



const app = createApp(App)

app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

// Register Dialog component globally
app.component('Dialog', Dialog);

// app.use(router)
app.mount('#app')
