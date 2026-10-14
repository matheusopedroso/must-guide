import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { gamesApiPlugin } from './vite/gamesApiPlugin.js';

export default defineConfig({
  plugins: [vue(), gamesApiPlugin()],
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
});
