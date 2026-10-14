# Must Guide

Irmão do Must Watch: jogos (RAWG ou IGDB) + troféus da PSN + guias. Construído aos poucos.

**Stack:** Vue 3 + Vite · Vue Router · SCSS (tokens + utilitárias) · Firebase Hosting + Functions (produção)

## Rodar local

```bash
npm install
cd functions && npm install && cd ..
copy .env.example .env.local   # e coloque RAWG_API_KEY e PSN_NPSSO
npm run dev                    # http://localhost:5173
npm run dev:host               # idem, acessível pelo celular na mesma rede
```

No `npm run dev` não precisa de Firebase: o próprio Vite responde `/api/games/**` e `/api/trophies/**`
usando o mesmo código das functions (`functions/src/core`). As chaves ficam no `.env.local`
sem o prefixo `VITE_`, então nunca vão para o navegador.

## Estrutura

```
must-guide/
├─ vite/apiPlugin.js           serve /api/** no dev (usa functions/src/core)
├─ functions/
│  ├─ .env                     GAMES_PROVIDER=rawg | igdb (vale para dev e produção)
│  ├─ index.js                 exporta os handlers
│  └─ src/
│     ├─ core/                 código puro, sem Firebase (roda no Vite e na function)
│     │  ├─ providers/rawg.js  busca, populares e detalhes no RAWG
│     │  ├─ providers/igdb.js  idem no IGDB (token Twitch em cache)
│     │  ├─ providers/index.js lista de provedores e os secrets de cada um
│     │  ├─ http.js            createApi, parseApiUrl, json, httpError, remember
│     │  ├─ gamesApi.js        rotas /api/games (popular, search, game)
│     │  ├─ trophiesApi.js     rotas /api/trophies (titles, list)
│     │  ├─ psn/auth.js        NPSSO → tokens (refresh automático, login único em paralelo)
│     │  ├─ psn/client.js      GET autenticado na API de troféus (pt-BR)
│     │  ├─ psn/trophies.js    jogos da conta + lista de troféus (descobre PS4/PS5)
│     │  ├─ gameShape.js       formato único de jogo + siglas de plataforma
│     │  └─ memoryCache.js
│     ├─ config.js             provedor ativo e opções (região SP)
│     └─ handlers/             games.js (secrets do provedor ativo) · trophies.js (PSN_NPSSO)
├─ src/
│  ├─ components/ui/           BaseButton, BaseTabs, SearchInput, GameCover, EmptyState, PageHeader…
│  ├─ components/layout/       AppHeader
│  ├─ components/games/        GameCard, GameCardSkeleton, GameGrid, GamePicker (select com pesquisa)
│  ├─ components/trophies/     PsnTitlePicker, TrophyList, TrophyItem, TrophyCounts
│  ├─ components/guide-editor/ SelectedGameCard, AddTabMenu, TabPlaceholder, tabs/TrophiesTab
│  ├─ composables/             useAsyncState, useGameSearch, useGameDetails, useGuideTabs, useQueryParam, useClickOutside, useDebounceFn, useTheme
│  ├─ services/                api.js (cliente com cache da sessão), games.service, trophies.service
│  ├─ config/                  app, providers, guideTabs, trophies
│  ├─ utils/                   cover.js (capa por provedor), text.js (comparar nomes de jogos)
│  ├─ pages/                   HomePage, GuideEditPage (/guia/novo?jogo=…&abas=…&aba=…&psn=…)
│  └─ styles/                  abstracts · base · layout · components · utilities
└─ firebase.json               Hosting + rewrites /api/games/** e /api/trophies/** → functions
```

## API de jogos

| Rota | Retorno | Cache (navegador / CDN) |
|---|---|---|
| `GET /api/games/popular` | mais adicionados do último ano | 10 min / 6 h |
| `GET /api/games/search?q=` | busca (mín. 2 letras) | 5 min / 1 h |
| `GET /api/games/game/:id` | detalhes (id com prefixo: `rawg-3498`) | 1 h / 24 h |

Em produção o Hosting guarda as respostas na CDN (`s-maxage`), então a maioria das visitas nem chega à function.

## API de troféus (PSN)

| Rota | Retorno | Cache (navegador / CDN) |
|---|---|---|
| `GET /api/trophies/titles` | jogos com troféus da conta do NPSSO | 5 min / sem CDN |
| `GET /api/trophies/list/:npId?service=` | grupos + troféus (pt-BR) de qualquer jogo | 1 h / 24 h |

Usa a API não oficial da PSN (mesmo fluxo da biblioteca psn-api). O `PSN_NPSSO` vale ~2 meses:
logado em playstation.com, abra https://ca.account.sony.com/api/v1/ssocookie e copie o `npsso`.
Em produção: `firebase functions:secrets:set PSN_NPSSO`.

## Trocar de provedor de jogos

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
