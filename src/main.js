import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/main.scss';
import './composables/useButtonStyle'; // estilo dos botões de controle (PS/Xbox) desde a abertura

createApp(App).use(router).mount('#app');
