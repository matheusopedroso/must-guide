import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { apiPlugin } from './vite/apiPlugin.js';

// Endereço do site publicado (tags de compartilhamento). Pode ser trocado por VITE_SITE_URL no .env
const DEFAULT_SITE_URL = 'https://must-guide-app.web.app';

// Troca %SITE_URL% no index.html (og:image e og:url precisam de URL completa)
const siteUrlPlugin = (siteUrl) => ({
  name: 'must-guide:site-url',
  transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl),
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const siteUrl = (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');

  return {
    plugins: [vue(), apiPlugin(), siteUrlPlugin(siteUrl)],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    css: {
      preprocessorOptions: {
        // Tokens e mixins disponíveis em todo <style lang="scss"> sem @use manual
        scss: { additionalData: `@use "@/styles/abstracts" as *;\n` },
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Bibliotecas num arquivo separado: mudam pouco e ficam em cache entre deploys
          manualChunks(id) {
            if (id.includes('node_modules')) return 'vendor';
          },
        },
      },
    },
  };
});
