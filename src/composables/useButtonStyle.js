import { watch } from 'vue';
import { useStoredRef } from './useStoredRef';

// Estilo dos botões de controle no texto (PlayStation ou Xbox), escolhido por cada pessoa e guardado no navegador.
// Vai para <html data-buttons="ps|xbox">: o CSS (_controller-keys.scss) desenha cada botão no estilo escolhido.
// Estado único para o app todo (módulo): importado no main.js para valer desde a abertura.
const style = useStoredRef('mg:buttons', 'ps');
watch(style, (v) => (document.documentElement.dataset.buttons = v), { immediate: true });

export const useButtonStyle = () => style;
