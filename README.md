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
│     │  ├─ trophiesApi.js     rotas /api/trophies (titles, list, progress)
│     │  ├─ psn/auth.js        NPSSO → tokens (refresh automático, login único em paralelo)
│     │  ├─ psn/client.js      GET autenticado na API de troféus (pt-BR)
│     │  ├─ psn/trophies.js    jogos da conta, lista de troféus (descobre PS4/PS5) e progresso/raridade
│     │  ├─ gameShape.js       formato único de jogo + siglas de plataforma
│     │  └─ memoryCache.js
│     ├─ config.js             provedor ativo e opções (região SP)
│     └─ handlers/             games.js (secrets do provedor ativo) · trophies.js (PSN_NPSSO)
├─ src/
│  ├─ components/ui/           BaseButton, BaseTabs, SearchInput, RichTextEditor (Pell), GameCover, EmptyState…
│  ├─ components/layout/       AppHeader
│  ├─ components/games/        GameCard, GameCardSkeleton, GameGrid, GamePicker (select com pesquisa)
│  ├─ components/trophies/     PsnTitlePicker, TrophyVersionBar, TrophyList, TrophyItem, TrophyFlags, TrophyTip, TrophyRefPicker, TrophyCounts
│  ├─ components/guide-editor/ SelectedGameCard, AddTabMenu, TabPlaceholder, tabs/TrophiesTab
│  ├─ composables/guide/       useGuideDraft (rascunho + gravação agrupada), useGuideTabs, useTrophyVersions, useTrophyNotes, useTrophyContext
│  ├─ composables/             useAsyncState, useGameSearch, useGameDetails, useQueryParam, useClickOutside, useDebounceFn, useTheme
│  ├─ services/                api.js (cliente com cache da sessão), games, trophies, draft (rascunho no navegador)
│  ├─ config/                  app, providers, guideTabs, trophies, editor (botões do Pell)
│  ├─ utils/                   cover, text, trophies, guideDraft, html (filtro de HTML do editor), trophyRef
│  ├─ pages/                   HomePage, GuideEditPage (/guia/novo?jogo=…&aba=…)
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
| `GET /api/trophies/progress/:npId?service=` | conquistados, data e raridade na conta (`null` se não tem o jogo) | 1 min / sem CDN |

Usa a API não oficial da PSN (mesmo fluxo da biblioteca psn-api). O `PSN_NPSSO` vale ~2 meses:
logado em playstation.com, abra https://ca.account.sony.com/api/v1/ssocookie e copie o `npsso`.
Em produção: `firebase functions:secrets:set PSN_NPSSO`.

## Rascunho do guia

Enquanto não há banco, o guia em edição fica no navegador (`localStorage`, chave `mg:guide-draft:<jogo>`),
já no formato do futuro documento do Firestore (`src/utils/guideDraft.js`):

```js
{ gameId, game, tabs: [], versions: [{ id, name, platform, service }], trophies: { [trophyId]: { tip, story, missable, online } } }
```

- `versions[0]` é a versão principal; as anotações valem para todas (ligadas pelo `trophyId`).
- `tip` = HTML do "Como conseguir" (editor Pell; filtrado ao colar, ao fechar e ao exibir — `src/utils/html.js`). As marcações (História, Perdível, Online) vêm de `TROPHY_FLAGS` em `src/config/trophies.js`: para criar outra, basta adicionar lá (botão e filtro aparecem sozinhos).
- Gravação agrupada (600 ms) e ao minimizar/sair da página.

## Editor de texto (Pell)

`src/components/ui/RichTextEditor.vue` (v-model = HTML). Os botões ficam em `src/config/editor.js`:
`name` igual a um botão do Pell (`bold`, `italic`, `ulist`, `olist`, `quote`, `code`…) reaproveita o comportamento;
para um botão novo, informe `result()` e, se tiver estado ligado/desligado, `state()`. Ícones vêm do lucide.

**Referência a troféu:** botão de troféu na barra ou digitar `@` no texto → escolhe o troféu → entra um chip
`<a href="#trofeu-ID" data-trophy="ID" data-type="gold" class="trophy-ref" contenteditable="false">Nome</a>`.
Na leitura, tocar no chip rola até o troféu (tira o filtro) e destaca. Vale nas versões PS4/PS5 (mesmo `trophyId`).
Cada troféu mostra **"Citado em:"** com os troféus que o mencionam (calculado das anotações em `useTrophyNotes` → `backlinks`).

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
