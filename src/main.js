import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/main.scss';
import './composables/useButtonStyle'; // estilo dos botões de controle (PS/Xbox) desde a abertura
import { registerPwa } from './pwa/register';

registerPwa(); // PWA: funciona sem internet depois da 1ª visita (só no build)

createApp(App).use(router).mount('#app');
