import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { apiPlugin } from './vite/apiPlugin.js';

// Endereço do site publicado (tags de compartilhamento). Pode ser trocado por VITE_SITE_URL no .env
const DEFAULT_SITE_URL = 'https://must-guide-app.web.app';

// Bibliotecas que toda página usa (chunk "vendor")
const VENDOR = /[\\/]node_modules[\\/](vue|@vue|vue-router|lucide-vue-next|pell)[\\/]/;

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
          // Bibliotecas da base num arquivo separado: mudam pouco e ficam em cache entre deploys.
          // O resto (Firebase e dependências) é carregado sob demanda e o Vite separa sozinho.
          manualChunks(id) {
            if (VENDOR.test(id)) return 'vendor';
          },
        },
      },
    },
  };
});
