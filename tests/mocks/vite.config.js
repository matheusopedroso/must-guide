import { fileURLToPath } from 'node:url';
import base from '../../vite.config.js';

// Servidor dos testes de ponta a ponta: o mesmo app, com o Firebase trocado por versões de mentira
// (tests/mocks/firebase — tudo no localStorage do navegador). RAWG, IGDB e PSN são simulados no servidor
// (tests/mocks/network, carregados pelo NODE_OPTIONS em playwright.config.js).
const here = (p) => fileURLToPath(new URL(p, import.meta.url));

export default (env) => {
  const cfg = base(env);
  cfg.resolve.alias = [
    { find: '@/services/firebase/auth', replacement: here('./firebase/auth.js') },
    { find: '@/services/guides.service', replacement: here('./firebase/guides.js') },
    { find: '@/services/progress.service', replacement: here('./firebase/progress.js') },
    { find: '@/services/library.service', replacement: here('./firebase/library.js') },
    { find: '@/services/trophyLists.service', replacement: here('./firebase/trophyLists.js') },
    { find: '@', replacement: here('../../src') },
  ];
  return cfg;
};
