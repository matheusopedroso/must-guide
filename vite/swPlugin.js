import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// PWA: no build, gera o /sw.js a partir de src/pwa/sw.js com a lista de arquivos do app e a versão (hash da
// lista). Assim o service worker guarda o app inteiro para abrir sem internet e muda a cada deploy.
// Só no build: no `npm run dev` não há service worker (atrapalharia o recarregamento do Vite).
export function swPlugin(template) {
  return {
    name: 'must-guide:sw',
    apply: 'build',
    generateBundle(_, bundle) {
      const assets = Object.values(bundle)
        .map((f) => `/${f.fileName}`)
        .filter((f) => /^\/assets\/.+\.(js|css|woff2?|svg|png|jpg|webp)$/.test(f))
        .sort();
      const version = createHash('sha1').update(assets.join('|')).digest('hex').slice(0, 10);
      const head = `self.__SW_VERSION = ${JSON.stringify(version)};\nself.__SW_ASSETS = ${JSON.stringify(assets)};\n`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: head + readFileSync(template, 'utf8') });
    },
  };
}
