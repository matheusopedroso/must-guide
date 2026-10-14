# Must Guide

Irmão do Must Watch: jogos (RAWG ou IGDB) + guias de troféus. Construído aos poucos.

**Stack:** Vue 3 + Vite · Vue Router · SCSS (tokens + utilitárias) · Firebase Hosting + Functions (produção)

## Rodar local

```bash
npm install
cd functions && npm install && cd ..
copy .env.example .env.local   # e coloque a RAWG_API_KEY
npm run dev                    # http://localhost:5173
npm run dev:host               # idem, acessível pelo celular na mesma rede
```

No `npm run dev` não precisa de Firebase: o próprio Vite responde `/api/games/**`
usando o mesmo código da function (`functions/src/core`). As chaves ficam no `.env.local`
sem o prefixo `VITE_`, então nunca vão para o navegador.

## Estrutura

```
must-guide/
├─ vite/gamesApiPlugin.js      serve /api/games/** no dev (usa functions/src/core)
├─ functions/
│  ├─ .env                     GAMES_PROVIDER=rawg | igdb (vale para dev e produção)
│  ├─ index.js                 exporta os handlers
│  └─ src/
│     ├─ core/                 código puro, sem Firebase (roda no Vite e na function)
│     │  ├─ providers/rawg.js  busca, populares e detalhes no RAWG
│     │  ├─ providers/igdb.js  idem no IGDB (token Twitch em cache)
│     │  ├─ providers/index.js lista de provedores e os secrets de cada um
│     │  ├─ gamesApi.js        rotas, validação, cache em memória e Cache-Control
│     │  ├─ gameShape.js       formato único de jogo + siglas de plataforma
│     │  └─ memoryCache.js
│     ├─ config.js             provedor ativo e opções (região SP)
│     └─ handlers/games.js     function HTTP (secrets só do provedor ativo)
├─ src/
│  ├─ components/ui/           BaseButton, BaseTabs, SearchInput, GameCover, EmptyState, PageHeader…
│  ├─ components/layout/       AppHeader
│  ├─ components/games/        GameCard, GameCardSkeleton, GameGrid, GamePicker (select com pesquisa)
│  ├─ components/guide-editor/ SelectedGameCard, TabPlaceholder (abas: componentes por vir)
│  ├─ composables/             useGameSearch, useGameDetails, useQueryParam, useDebounceFn, useTheme
│  ├─ services/games.service.js  fetch para /api/games com cache da sessão
│  ├─ config/                  app, providers, guideTabs (abas do editor)
│  ├─ utils/cover.js           tamanho da capa por provedor
│  ├─ pages/                   HomePage, GuideEditPage (/guia/novo?jogo=…&aba=…)
│  └─ styles/                  abstracts · base · layout · components · utilities
└─ firebase.json               Hosting + rewrite /api/games/** → function "games"
```

## API de jogos

| Rota | Retorno | Cache (navegador / CDN) |
|---|---|---|
| `GET /api/games/popular` | mais adicionados do último ano | 10 min / 6 h |
| `GET /api/games/search?q=` | busca (mín. 2 letras) | 5 min / 1 h |
| `GET /api/games/game/:id` | detalhes (id com prefixo: `rawg-3498`) | 1 h / 24 h |

Em produção o Hosting guarda as respostas na CDN (`s-maxage`), então a maioria das visitas nem chega à function.

## Trocar de provedor

| Provedor | Chaves | Observações |
|---|---|---|
| RAWG | `RAWG_API_KEY` | capas horizontais (cortadas no card) · exige crédito com link (já exibido) |
| IGDB | `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` | app em dev.twitch.tv (exige 2FA) · capas verticais |

1. Coloque as chaves no `.env.local` (dev) e no Secret Manager (`firebase functions:secrets:set NOME`).
2. Mude `GAMES_PROVIDER` em `functions/.env`.
3. Reinicie o `npm run dev` / rode `npm run deploy:functions`.

## Utilitárias SCSS

Espaçamento em múltiplos de 8px (`1` = 8px): `p-2`, `px-3`, `mt-1`, `gap-2`, `gap-y-3`…
Layout: `d-flex`, `flex-column`, `align-center`, `justify-between`, `flex-1`, `d-md-none`…
Outras: `radius-1|2|3|full`, `text-muted`, `text-sm`, `fw-600`, `truncate`, `line-clamp-2`, `surface`.
Tokens e mixins (`space()`, `up(md)`, `$r1`…) já estão disponíveis em todo `<style lang="scss">`.
