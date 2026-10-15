// PWA: registra o service worker (só no site gerado pelo build) e, quando um deploy novo apaga arquivos que uma
// aba antiga ainda ia carregar (troca de página), recarrega a página uma vez em vez de quebrar.
export function registerPwa() {
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
  window.addEventListener('vite:preloadError', (event) => {
    if (sessionStorage.getItem('mg:reloaded')) return; // evita recarregar em loop
    sessionStorage.setItem('mg:reloaded', '1');
    event.preventDefault();
    window.location.reload();
  });
  window.addEventListener('load', () => setTimeout(() => sessionStorage.removeItem('mg:reloaded'), 5000));
}
