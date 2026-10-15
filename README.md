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
sem o prefixo `VITE_`, então nunca vão para o navegador. Nenhum `.env` vai para o git (só os `.env.example`).

## Estrutura

```
must-guide/
├─ vite/apiPlugin.js           serve /api/** no dev (usa functions/src/core)
├─ functions/
│  ├─ .env.example             modelo do functions/.env (GAMES_PROVIDER=rawg | igdb; sem o arquivo usa rawg)
│  ├─ index.js                 exporta os handlers
│  ├─ scripts/set-admin.js     dá/tira o papel de admin (Custom Claim)
│  └─ src/
│     ├─ core/                 código puro, sem Firebase (roda no Vite e na function)
│     │  ├─ providers/rawg.js  busca, populares e detalhes no RAWG
│     │  ├─ providers/igdb.js  idem no IGDB (token Twitch em cache)
│     │  ├─ providers/index.js lista de provedores e os secrets de cada um
│     │  ├─ http.js            createApi, parseApiUrl, json, httpError, remember
│     │  ├─ gamesApi.js        rotas /api/games (popular, search, game)
│     │  ├─ trophiesApi.js     rotas /api/trophies (titles, player, list, progress)
│     │  ├─ psn/auth.js        NPSSO → tokens (refresh automático, login único em paralelo)
│     │  ├─ psn/client.js      GET autenticado na API de troféus (pt-BR)
│     │  ├─ psn/trophies.js    jogos da conta, lista de troféus (descobre PS4/PS5) e progresso/raridade
│     │  ├─ gameShape.js       formato único de jogo + siglas de plataforma
│     │  └─ memoryCache.js
│     ├─ config.js             provedor ativo e opções (região SP)
│     ├─ auth.js               requireAdmin (token do Firebase com a claim admin)
│     └─ handlers/             games.js (secrets do provedor ativo) · trophies.js (PSN_NPSSO)
├─ src/
│  ├─ components/ui/           BaseButton, BaseTabs, ScrollRail (trilho lateral), PageBar (barra flutuante: voltar · título · compartilhar), PillTabs (abas em pílula), ActionIcon (ação em círculo), DropdownMenu, IconSelect, NumberStepper, SearchInput, RichTextEditor (Pell), RatingInput, ProgressBar, BaseModal (pilha, foco, arrastar p/ fechar), VideoModal (YouTube no app), GameCover, EmptyState…
│  ├─ components/layout/       AppNav (barra flutuante do topo), MobileTabBar (barra de baixo no celular), AccountMenu, AccountSummary, AccountAvatar, AppLogo
│  ├─ components/games/        GameCard, GameCardSkeleton, GameGrid, GamePicker (select com pesquisa)
│  ├─ components/trophies/     PsnTitlePicker, RefTextEditor (editor que cita troféus com @), RefText (leitura do texto), TrophyHeader (lista + versões + visão geral), TrophyList, TrophyToolbar, TrophyItem, TrophyMetaTags, TrophyDetailsEditor, TrophyFlags, TrophyTip, TrophyRefPicker, TrophyCounts
│  ├─ components/sections/     SectionEditor (seção/etapa no editor), SectionTrophyGrid (troféus da seção), SectionsView (leitura) — abas Guia e Roadmap
│  ├─ components/guides/       GuideCard (Meus guias), GuideHero, GuideOverview (aba Visão geral), GuideTrophiesView (aba Troféus, leitura)
│  ├─ components/guide-editor/ PublishControl (Publicar / voltar para rascunho), SaveStatus, GuideStatsSummary, SelectedGameCard, GuideStats (resumo) + GuideStatsModal (edição), DifficultyPicker, DifficultyBadge, AddTabMenu, TabPlaceholder, tabs/TrophiesTab
│  ├─ composables/guide/       useGuideDraft (rascunho + nuvem, publicar), useGuide (leitura), useMyGuides (lista), useTrophyData (lista/progresso da versão), useSections (seções das abas Guia/Roadmap), useGuideTabs, useTrophyVersions, useTrophyNotes, useTrophyContext, useTrophyListView (busca/filtro/ordem), useGuideStats
│  ├─ composables/             useNavVisibility (barras somem ao rolar), useIsStuck (sticky grudado), useScrolledPast, useAuth (sessão), useToast, useModalStack (Esc/voltar fecham o modal de cima), useStoredRef (preferências no navegador), useAsyncState, useGameSearch, useGameDetails, useQueryParam, useClickOutside, useDebounceFn, useTheme
│  ├─ services/                api.js (cliente com cache da sessão), games, trophies, draft (navegador), guides (Firestore), firebase/ (app, auth)
│  ├─ config/                  app, navigation (abas da navegação), firebase, providers, guide (stats), guideTabs, trophies, editor (botões do Pell)
│  ├─ utils/                   cover, date, sections (seções das abas de texto), share (link/copiar), text, trophies, difficulty (faixa/cor 1–10), guideDraft, html (filtro de HTML do editor), trophyRef, url
│  ├─ assets/brand/logo.js     paths do logo (usados pelo AppLogo)
│  ├─ pages/                   HomePage (/), MyGuidesPage (/guias), GuideEditPage (/guia/novo · /guia/:id/editar?aba=…), GuideViewPage (/guia/:id)
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
| `GET /api/trophies/player/:psnId` | jogos de outro perfil público (`{ player, titles }`) — para vincular jogo que a conta não tem | 10 min / sem CDN |
| `GET /api/trophies/find?q=nome&platform=` | **busca automática** da lista pelo nome: sua conta + perfis de referência (`{ results }` com `sources`) | 10 min / sem CDN |
| `GET /api/trophies/list/:npId?service=` | grupos + troféus (pt-BR, com `nameEn` em inglês) de qualquer jogo | 1 h / 24 h |
| `GET /api/trophies/progress/:npId?service=` | conquistados, data e raridade na conta (`null` se não tem o jogo) | 1 min / sem CDN |

**Vincular um jogo:** a PSN só mostra o código da lista (NPWR) de jogos que *alguém* já abriu. No editor
(`PsnTitlePicker`): **busca automática** (padrão), sua conta, **perfil de outra pessoa** (ID da PSN de quem já jogou,
com troféus públicos — os usados ficam em `mg:psn-players`) ou o código colado.

**Busca automática (jogos que você nunca jogou):** procura pelo nome na sua conta e nos acervos de perfis públicos
de caçadores de troféus com milhares de jogos (`PSN_REFERENCE_PLAYERS` no `.env.local`, IDs separados por vírgula;
vazio = `Hakoom,dav1d123,ikemenzi`). Lê todas as páginas de cada perfil (800 jogos por chamada, 4 em paralelo) e
guarda 24 h na memória do servidor — a 1ª busca depois de subir o `npm run dev` leva alguns segundos. Perfil que não
existir ou ficar privado é ignorado (aviso no terminal). Nome comparado sem acento/™ (`functions/src/core/text.js`,
o mesmo do app). Jogo lançado agora pode ainda não estar em nenhum acervo: aí vale o perfil de quem já jogou.
- **Sincronizar com a PSN sem guia:** na aba Troféus do jogo, **Sincronizar com a PSN** guarda o vínculo jogo ↔ lista
  na biblioteca (`links` em `mg:library` / `users/{uid}/data/library`, sem criar guia). Sincronizado, a aba mostra o
  **seu progresso** (conquistados em verde, "Você: x de y", Atualizar), **Trocar lista** e **Desvincular**; a lista
  "Meus jogos da PSN" abre o jogo pelo ícone do controle. Sem sugestão (ou outra lista): **Escolher a lista** abre a
  busca completa (busca automática, sua conta, outro perfil, código). Nas sugestões, a da sua conta vem primeiro.
- **Página do jogo:** abas **Detalhes** · **Troféus** (`?aba=trofeus`, só quem edita; a busca roda ao abrir a aba)
  com a lista achada — versões PS4/PS5 em chips (região repetida mostra o código), os troféus do jogo base e
  **Criar guia com esta lista** (abre o editor já vinculado: `?lista=NPWR…`).
- **Comparação de nomes** (`functions/src/core/text.js`, a mesma no app e na API): por palavras inteiras; nome em
  escrita japonesa/chinesa/coreana ou largura total nunca casa com nome latino. A **página do jogo só escolhe a lista
  sozinha se for o MESMO jogo** (`isSameGame`: nome igual tirando ™ e sufixos de edição como Remastered, Director's
  Cut, PS5); parecido fica para escolher à mão no editor ("Não é este jogo? Escolher outra lista").
- Mudou a regra da busca? Suba `FIND_VERSION` em `trophies.service.js` (a resposta fica 10 min no navegador) e
  **reinicie o `npm run dev`** (o código da API em `functions/` roda no servidor do Vite).

Usa a API não oficial da PSN (mesmo fluxo da biblioteca psn-api). O `PSN_NPSSO` vale ~2 meses:
logado em playstation.com, abra https://ca.account.sony.com/api/v1/ssocookie e copie o `npsso`.
Em produção: `firebase functions:secrets:set PSN_NPSSO`.

## Firebase (login e guias na nuvem)

Login com Google (Firebase Auth) e guias no Firestore (`guides/{gameId}`). Sem as variáveis `VITE_FIREBASE_*`
o app continua funcionando só com o rascunho no navegador.

1. Console do Firebase → **Authentication** → Método de login → ative **Google**.
   Em Configurações → Domínios autorizados, confira `localhost` e o domínio do Hosting.
2. **Firestore Database** → Criar banco → modo produção, região `southamerica-east1` (São Paulo).
3. Configurações do projeto → Seus apps → app **Web** → copie a config para o `.env.local` (`VITE_FIREBASE_*`, ver `.env.example`).
4. Publique as regras: `firebase deploy --only firestore`.
5. Entre no app com sua conta Google uma vez e torne-a admin (Custom Claim, igual ao Must Watch):
   `cd functions && node scripts/set-admin.js seu@email.com` (com `GOOGLE_APPLICATION_CREDENTIALS` apontando
   para a chave da conta de serviço, guardada fora do projeto). Saia e entre de novo.

| Peça | Arquivo |
|---|---|
| Config (pública) | `src/config/firebase.js` |
| SDK sob demanda (app + Firestore *lite*) | `src/services/firebase/app.js` |
| Login Google (popup; redirect se bloqueado) | `src/services/firebase/auth.js` · estado em `src/composables/useAuth.js` |
| Guias (ler/gravar) | `src/services/guides.service.js` |
| Sincronização navegador ↔ nuvem | `src/composables/guide/useGuideDraft.js` |
| Regras | `firestore.rules` (admin grava guias; publicado qualquer um lê; progresso só o dono) |
| Rotas pessoais da PSN | `/api/trophies/titles`, `player` e `progress` exigem token de admin em produção (`functions/src/auth.js`); no `npm run dev` ficam abertas |

O SDK só é baixado se o aparelho já teve login ou ao clicar em **Entrar** (quem só visita não carrega nada).

## Início

Sem busca, antes dos "Populares agora":
- **Continuar editando** (só quem edita): os 4 guias editados por último (navegador + nuvem), com status, dificuldade
  e "editado há 5 minutos" — tocar abre o **editor**.
- **Guias publicados** (todo mundo): capa, nome, dificuldade e dicas, do mais novo para o mais antigo (até 12) —
  tocar abre a **leitura**.

O admin já lê todos os guias para a primeira lista, então os publicados saem dali (sem outra leitura no Firestore);
quem não é admin lê só os publicados, guardados 5 min na memória. Peças: `useHomeGuides.js`, `GuideCoverCard.vue`,
`GuideLinkList` (modo `edit`) e `timeAgo` em `utils/date.js`.

## Biblioteca pessoal (`/biblioteca`)

Botão **Biblioteca** na página do jogo e na leitura do guia: **Jogando**, **Quero platinar**, **Platinado** ou tirar
da biblioteca. A página `/biblioteca` (aba "Biblioteca" na navegação; "Jogos" no celular) mostra os jogos com filtro
por status (`?status=`), mais recentes primeiro; o início ganha **Jogando agora**; os cards de jogo/guia mostram o selo
do status (no celular, só o ícone). Platinou na PSN (100% no guia do jogo base) → a leitura sugere "Marcar como
Platinado na biblioteca".

**Aba "Meus jogos da PSN"** (`/biblioteca?aba=psn`, quem edita): todos os jogos da conta do `PSN_NPSSO` (todas as
páginas) com totais (jogos, platinas, 100%, conclusão média, troféus por tipo) e filtros por nome, status (Platinados,
Platina pendente, 100%, Em andamento, Não começados) e plataforma (cross-buy conta nas duas); ordem (recentes,
progresso, nome) guardada no navegador. Lista já vinculada a um guia → "Guia"; sem guia → procura o jogo no início.
Lógica em `src/utils/psnGames.js`; componente `components/library/PsnGames.vue`.

Dados: sempre no navegador (`mg:library`) e, logado, num documento só na conta (`users/{uid}/data/library` — 1 leitura
ao abrir o app; regra em `firestore.rules`), agrupado em 1,5 s; vale a cópia editada por último. Guarda uma cópia do
jogo (nome, capa, ano, plataformas), então a página abre sem ir à API de jogos. Peças: `useLibrary.js` (estado único),
`config/library.js` (status), `services/library.service.js`, `components/library/` (`LibraryButton`, `LibraryBadge`).
**Publique as regras novas:** `firebase deploy --only firestore:rules`.

## Lista de troféus com cópia no Firestore

A leitura do guia não depende da API da PSN rodando (útil no site publicado sem functions — plano Spark):
- **Editor** (admin): busca a lista na API (sempre a mais nova) e confere a cópia em `trophyLists/{NPWR…}` uma vez por
  sessão — grava se faltar, se for de formato antigo (`LIST_VERSION`) ou se a lista mudou. Ao **publicar**, garante a
  cópia de todas as versões do guia.
- **Leitura** (todo mundo): cópia do Firestore primeiro (1 leitura), API se não houver cópia; sem nenhuma das duas
  (sem internet), a última lista vista neste navegador (`mg:trophy-list:<npId>`).
- Regras: leitura pública (são dados públicos da PSN), escrita só do admin. **Publique as regras:**
  `firebase deploy --only firestore:rules`. O progresso pessoal (conquistados, raridade) continua vindo da API.
Peças: `services/trophyListSource.js` (de onde vem a lista), `services/trophyLists.service.js` (Firestore),
`useTrophyData` (`prefer: 'api' | 'saved'`).

## Publicar e ler o guia

| Rota | O quê |
|---|---|
| `/guias` | **Meus guias**: rascunhos e publicados (nuvem do admin + rascunhos deste navegador), filtro por status |
| `/guia/novo` | escolher o jogo → vai para o editor (o endereço antigo `?jogo=` redireciona) |
| `/guia/:id/editar` | editor; **Publicar** (pede confirmação e grava na nuvem na hora) · publicado: copiar link / voltar para rascunho |
| `/guia/:id` | leitura: jogo, visão geral, troféus e dicas sem edição. Publicado → qualquer pessoa; rascunho → só o admin (ou a cópia deste navegador) |

Publicar exige o admin logado e a lista de troféus vinculada. Depois de publicado, as edições continuam
salvando sozinhas e aparecem na hora para quem lê. O progresso da conta (conquistados) só aparece para o admin.

### Página de leitura (mesmo formato da página de título do Must Watch)

`GuideViewPage` = `PageBar` (gruda abaixo da navegação; no celular entra só depois de rolar) → `GuideHero`
(fundo do jogo desfocado atrás da navegação, capa, selos, título, meta, visão geral na linha das "notas",
ações em círculo e o seu progresso) → `PillTabs` (Visão geral · Troféus, em `?aba=`).
**Visão geral** (`GuideOverview`): sobre o jogo + ficha (`.facts`) à esquerda, cartão "Para platinar" à direita
(lugar do "Onde assistir") e os troféus que pedem atenção (Perdíveis, História, Online) — tocar leva ao troféu.
Classes de texto das páginas de detalhe em `src/styles/components/_detail-page.scss` (`.kicker`, `.section-heading`, `.facts`, `.label-row`, `.pill`).
No celular (rota com `meta.immersive`): sem a barra de navegação do topo, a imagem do jogo nítida (1280px) na largura
da tela até o alto, voltar/compartilhar redondos por cima e a PageBar completa só depois de rolar — como no Must Watch.

### Editar direto da leitura

Quem pode editar vê um **lápis** em cada seção (todas as abas) e em cada coletável. A seção abre o editor na mesma
aba e página, rolando até ela com a borda piscando (`#secao-…`); o coletável abre a aba Coletáveis já com a janela
dele aberta (`?coletavel=…`, que sai da URL depois de abrir). Links montados em `useEditLinks.js` (contexto provido
pelo `useGuideReader`); sem permissão, o lápis não aparece.

### Busca no guia

Lupa na `PageBar` da leitura ou a tecla **/** (fora de campos de texto) abrem `GuideSearchModal`: busca no texto de
todas as abas e páginas, nos troféus (nome PT/EN, descrição, dica e capítulo) e nos coletáveis (nome, tipo, local e
descrição). Sem acento e sem maiúsculas ("lamina" acha "lâmina"), resultados separados por tipo com o trecho em destaque.
Tocar leva à seção (aba, página e `#secao-…`), à página do troféu ou abre o coletável; **Enter** abre o primeiro.
Lógica em `src/utils/guideSearch.js` (`buildSearchIndex` monta o índice só com a busca aberta; `searchGuide` pontua:
título que começa com o termo > título que contém > só no texto).

## Abas de seções (Guia, Roadmap, Coletáveis, Detonado, Perdíveis, Online, Dicas)

As duas abas usam o mesmo modelo, configurado em `src/config/guideTabs.js` (`sections`: onde guardar, nome da
seção, numerada ou não, textos de ajuda) e as mesmas peças (`SectionsTab` no editor, `SectionsView` na leitura,
`useSections`, `src/utils/sections.js`). Para criar outra aba assim, basta adicionar `component: SectionsTab` e `sections: {…}`.

| Aba | Fica em | Cada parte | Rótulo |
|---|---|---|---|
| **Guia** (fixa, **paginada**) | `guide` | Página → seções (Introdução, Capítulo 1…) | só o título |
| **Roadmap** (opcional) | `roadmap` | Etapa | "Etapa 1: título" |
| **Coletáveis** | `collectibles` | Região (Capítulo 3, Floresta…) + **coletáveis** com caixa de marcar | só o título |
| **Detonado** | `walkthrough` | Capítulo (masculino) | "Capítulo 1: título" |
| **Perdíveis** | `missables` | Seção · + troféus marcados como Perdível no topo | só o título |
| **Online** | `online` | Seção · + troféus marcados como Online no topo | só o título |
| **Dicas** (opcional) | `tips` | Dica (Melhor build, Farm de dinheiro…) | só o título |

`masc: true` ajusta os textos ("deste capítulo"); `flag` (Perdíveis/Online) lista sozinho, no topo da leitura, os
troféus com aquela marcação na aba Troféus — a aba aparece mesmo sem seções escritas.

Roadmap: a platina dividida em **etapas** (como o roadmap do PSNProfiles):
cada etapa tem título, texto corrido (mesmo editor do "Como conseguir": negrito, listas, links e `@` para citar
troféus) e os **troféus desta etapa** em grade. "Adicionar os N citados no texto" puxa para a lista os troféus
citados. No editor: subir/descer/remover etapa e quantos troféus já estão em alguma etapa.
Na leitura (`/guia/:id?aba=roadmap`): índice das etapas, texto e grade (conquistados em verde); tocar num troféu
abre a aba Troféus nele. Formato (as duas abas): `[{ id, title, body, trophies: [trophyId] }]` (`src/utils/sections.js`).
A leitura mostra a aba só se ela tiver alguma seção preenchida.

### Abas paginadas (Guia)

`sections.paged: true` (como os guias do IGN e do TrueAchievements): a aba guarda **páginas**, cada uma com as suas
seções — `[{ id, title, sections: [{ id, title, body, trophies }] }]` (`src/utils/pages.js`). Guias antigos (seções
soltas) viram a Página 1 ao abrir (`toPages` em `normalizeDraft`).
- **Editor:** `PageNavEditor` (lista das páginas, nova página, título, mover e remover) + as seções da página aberta
  (`useSections` com a página como dona da lista; `usePages`). Cada seção tem "Outra página" para mudar de página.
  A página aberta fica em `?pagina=` (a 1ª fica sem).
- **Leitura:** `PagedSectionsView` — sumário ao lado (no celular, seletor), "Página N de M", as seções e
  Anterior/Próxima. Cada troca entra no histórico (`?pagina=2`): o voltar do navegador volta a página.
  Páginas sem conteúdo não aparecem. Para paginar outra aba (ex.: Detonado), basta `paged: true` na config.

### Cartão do troféu e contador no texto (como o TrueAchievements)

No editor de qualquer aba de texto:
- **Cartão do troféu** (ícone de cartão): escolhe o troféu e ele entra como bloco entre os parágrafos
  (`<div class="trophy-card" data-trophy-card="12">Nome</div>`). Na leitura, `RefText` monta o cartão completo
  com a lista e o seu progresso (`fillTrophyCard`), com o **mesmo visual da grade "Troféus desta seção"**
  (`.trophy-tile`, global em `_trophy-ref.scss`), na largura inteira do texto: ícone, troféu na cor do tipo + nome, descrição e o check verde se
  você tem; raridade na dica. Tocar abre o troféu. Troféu citado **sozinho numa linha** (o parágrafo só tem o chip)
  também vira esse cartão na leitura (`promoteLoneTrophyRefs`); no meio da frase continua chip.
- **Contador** (#): "6/18 chefes derrotados" — feito, total, texto e troféu ligado (opcional; o total vem da PSN
  quando o troféu tem contador). Com troféu vira um chip que leva a ele (`a.trophy-ref.trophy-count`); sem, `span.count-tag`.
- **Troféu citado entra na lista da seção:** chip, contador ou cartão novo no texto → o troféu vai sozinho para
  "Troféus desta seção" (`useSections.update`). Tirar da lista continua valendo enquanto não for citado de novo.

### Botões do controle no texto (PlayStation / Xbox)

Botão do controle na barra do editor → grade com ação (✕ ○ □ △), gatilhos, analógicos, direcional e sistema.
O texto guarda a **posição genérica** (`<span class="btn-key" data-key="face-down">Cruz</span>` — ids em
`src/config/controllerKeys.js`) e cada pessoa vê no estilo que escolher: ✕ ↔ A, ○ ↔ B, L1 ↔ LB, Options ↔ Menu…
A escolha (`useButtonStyle`, guardada no navegador) vai para `<html data-buttons="ps|xbox">` e o desenho sai do CSS
(`styles/components/_controller-keys.scss`, formas em SVG e letras — sem logotipos). Na leitura, texto com botões
mostra a escolha PlayStation / Xbox. Para um botão novo: adicione na config e o desenho no SCSS (mesmo id).

## Página do troféu (`/guia/:id/trofeu/:trophyId`)

Como a página de conquista do TrueAchievements (`TrophyPage`): topo (`DetailHero` com o ícone do troféu, tipo,
selos — você tem, Perdível… —, descrição, nome em inglês, % de jogadores e "Troféu N de M"), ações (Na lista,
Vídeo, Editar, Compartilhar), **Como conseguir** (o texto do guia, com botões PS/Xbox e troféus citados) + etiquetas,
**Onde aparece no guia** (seções de todas as abas que citam o troféu ou o têm na lista — `utils/citations.js`, leva
direto à seção: `?aba=…&pagina=…#secao-…`), **Citado nas dicas de** (outros troféus) e anterior/próximo
(`PrevNextNav`, o mesmo das páginas do guia). Lateral: raridade com barra e quando você conquistou.
- Na leitura, **tocar num troféu abre a página dele**: texto, cartões, grade da seção, Visão geral e o nome na aba
  Troféus (`pageOf` → `trophyPageRoute`). "Na lista" volta à aba Troféus já no troféu (`?aba=trofeus&trofeu=12`).
  No editor nada muda (rola até o troféu na lista).
- A leitura do guia e a do troféu montam os dados do mesmo jeito: `useGuideReader` (guia, jogo, anotações,
  versões, lista e progresso, coletáveis).

### Spoiler e imagens no texto

- **Spoiler** (olho riscado na barra): o trecho selecionado vira `<span class="spoiler">` (dentro de um parágrafo;
  com o cursor num spoiler, o botão tira). Na leitura fica borrado e o 1º toque só revela (`RefText`).
- **Imagem** (imagem com +): escolhe entre as artes e screenshots do jogo (IGDB → `images` nos detalhes; RAWG → as
  2 imagens de fundo) ou cola um link https, com legenda. Entra como bloco
  `<figure class="guide-img"><img src loading="lazy"><figcaption>` (`utils/textBlocks.js`); o filtro só aceita
  imagem dentro desse bloco (imagem colada de site sai). Na leitura, tocar abre a versão grande (IGDB: `t_1080p`).

### Caixas de aviso

Botão de aviso na barra → **Atenção / Perdível / Dica / Nota** (`config/callouts.js`): o parágrafo do cursor vira
`<div class="callout" data-kind="…">` (o mesmo tipo de novo tira; outro tipo troca). Na leitura: faixa na cor do
tipo, fundo claro e o rótulo no topo (`_rich-text.scss`). Tipo novo: config + SCSS (mesmo id).

## Checklist de quem lê

Na leitura, cada troféu tem um círculo para **marcar como feito** (grade das seções, aba Troféus e página do troféu
"Marcar feito"); o cartão no texto acompanha. Feito = marcado **ou** conquistado na PSN (esse não desmarca).
Progresso: "x/y feitos" em cada seção, por página no sumário do Guia e "Seu checklist" na Visão geral.
Guardado junto com os coletáveis (`usePersonalProgress`: navegador `mg:collected:<guideId>` e, logado,
`users/{uid}/progress/{guideId}` → `{ collected, trophies, editedAt }`). Contexto: `useTrophyChecklist`
(provido por `useGuideReader`; o editor não tem checklist).

## Coletáveis (modelo do IGN + PowerPyx)

Na aba Coletáveis cada **região** (seção) tem a lista de coletáveis: nome, tipo, local/checkpoint, **como achar** (mesmo
editor Pell das abas: botões do controle PS/Xbox, troféus citados, spoiler, caixa de aviso… — texto antigo simples vira parágrafo),
até 4 imagens (links), vídeo (YouTube com tempo toca no app), marcas **Perdível** e **Não conta para o troféu** e o
**crédito** de quem fez as imagens/vídeo (nome + link). No editor: digite o nome + Enter para adicionar rápido e
complete os detalhes no lápis. Toda seção (de qualquer aba) aceita um **vídeo** — vira o botão "Ver vídeo" no título.

**Leitura:**
- Topo: "x de y coletáveis", um chip por tipo (`Artefato 3/12`) que também **filtra** a lista, o chip **Perdíveis**,
  "Esconder coletados" e **Compacto** (uma linha por coletável que abre ao tocar — bom para 100+). As duas opções
  ficam guardadas no navegador.
- **Numeração por tipo no guia todo**, na ordem ("Artefato #4", como o contador do jogo); os que não contam ficam sem número.
- Em cada região: a contagem por tipo (`Artefato 0/7 · Pingente 0/3`) e no índice o progresso da região.
- Cartão: "Artefato #4" | nome | marcas, Tipo | Local, descrição, imagens, vídeo, crédito e a caixa **para marcar**.
- **Vários no mesmo lugar** (PowerPyx: "Artifact #1: … + Artifact #2: …"): marque **Mesmo lugar do anterior** no
  coletável de baixo. Vira um cartão só — título "Artefato #1: Panfleto + Artefato #2: Mapa", local/descrição/imagens/
  vídeo/crédito do 1º e **uma caixa para cada** (cada um conta e numera separado). No compacto, a caixa da linha marca
  o grupo todo. No editor a linha fica recuada (↳). O chip no texto de qualquer um deles abre o cartão do grupo.

- **Próximo que falta** rola até o próximo não marcado (respeita o filtro) e **Recomeçar** desmarca todos, com
  confirmação (nova jogada; os troféus não mudam).
- **Imagens em tela cheia** dentro do app (`ui/ImageLightbox.vue`): setas na tela e no teclado, Esc / voltar fecham,
  "Abrir original" leva ao link.
- **Perdíveis:** os coletáveis marcados como Perdível entram sozinhos na aba **Perdíveis** (linha compacta, dá para
  marcar ali) e a Visão geral mostra "x/y · N perdíveis" no cartão Para platinar.

- **Mapa da região** (como o IGN): imagem por link na região e um ponto por coletável (inicial do tipo + número:
  "A3"); verde quando coletado. Tocar no ponto leva ao cartão (tira o filtro / "Esconder coletados" se ele estiver
  escondido); o botão de ampliar abre o mapa em tela cheia. No editor: **Pontos no mapa** → escolha o coletável e toque
  no mapa (passa sozinho para o próximo sem ponto). Pontos em % da imagem (`item.pin = { x, y }`).
- **Tipo ligado ao troféu** (editor, aba Coletáveis → "Tipos ligados a troféus"; `guide.collectibleTypes`): o chip do
  tipo mostra o troféu e a **página do troféu** mostra "Coletáveis deste troféu" com o progresso e o atalho para a aba
  já filtrada (`?tipo=`).
- Imagens no meio do texto (todas as abas) também abrem em **tela cheia** — uma janela só no app (`useLightbox` +
  `LightboxHost`), passando entre as imagens daquele texto.

**No editor:** o campo de adicionar tem o **tipo** (fica lembrado entre regiões) e aceita **colar uma lista** — uma
linha por coletável: `Nome`, `Tipo: Nome`, `Tipo #3: Nome` (formato do PowerPyx) e marcadores de lista; vários na
mesma linha com ` + ` entram como "mesmo lugar do anterior" (`parseCollectibleLines`). Na janela do coletável,
**Mover** leva para o fim de outra região.

**Créditos do guia:** no editor (aba Troféus, ao lado de "Dificuldade, jogadas e horas") — nome, link e o que fez.
Na leitura aparecem no fim da página, em todas as abas, junto com os nomes citados nos coletáveis (sem repetir).
Lógica em `src/utils/collectibles.js` (`collectiblesOf` com número, `summarizeByType`, `matchesFilter`, `creditsOf`).

**Marcar no meio do guia:** em qualquer texto (Detonado, Roadmap, Guia…) o botão da **joia** cita um coletável
(com o nome selecionado, o trecho vira o link). Na leitura o chip tem uma caixinha: tocar nela marca/desmarca e vale
para o guia todo (a aba Coletáveis mostra igual); tocar no nome abre os detalhes.

**Progresso por pessoa:** sempre no navegador (`mg:collected:<guideId>`) e, logado, também em
`users/{uid}/progress/{guideId}` (só a própria pessoa lê/grava — `firestore.rules`), agrupado em 1,5 s; vale a cópia
editada por último. Peças: `src/components/collectibles/` (`CollectiblesOverview`, `CollectibleCard`…),
`useCollectibleView.js` (filtro/compacto/contagens da leitura), `useCollectibles.js` (contexto), `usePersonalProgress.js`,
`src/utils/collectibles.js`, `src/services/progress.service.js`, `GuideCredits.vue` / `GuideCreditsEditor.vue`,
`ui/VideoButton.vue` (YouTube no app, outro site em nova aba).

## Guias de DLC (um guia separado por DLC)

Cada DLC com troféus próprios (grupo da lista da PSN, ex.: `001`) vira **outro guia**, com troféus, guia, roadmap,
coletáveis, dificuldade e status próprios — como no PSNProfiles.

- **Id:** guia do jogo = `gameId` (`rawg-123`); guia da DLC = `gameId~grupo` (`rawg-123~001`), com
  `parentId: gameId` e `dlc: { groupId, name, icon }` (`src/utils/guideIds.js`: `dlcGuideId`, `parseGuideId`, `guideIdOf`).
- **Troféus por guia** (`src/utils/trophyScope.js`): o guia do jogo mostra só o grupo base (`default`) quando a lista
  tem DLCs; o da DLC, só o grupo dela. `useTrophyData(…, { scope })` devolve a lista recortada (e `fullList`).
- **Editor do jogo → aba DLCs** (`DlcTab`, só em guia de jogo — `gameOnly`): lista os grupos de DLC da versão principal
  com o status do guia; "Criar guia da DLC" copia as versões e as anotações dos troféus daquele grupo e abre
  `/guia/<id-da-dlc>/editar`. A aba Troféus avisa quantas DLCs a lista tem.
- **Leitura:** o guia do jogo lista as DLCs (`DlcGuideList`, só as publicadas para quem não é admin —
  `listDlcGuides`); o da DLC mostra "Guia de DLC", o ícone da DLC e o link para o jogo. Em Meus guias aparece o selo "DLC".
- **Regras:** `guides/{guideId}` exige `guideId` (ou `gameId`, nos antigos) igual ao id do documento. Rode
  `firebase deploy --only firestore` depois de atualizar o `firestore.rules`.

## Página do jogo (`/jogo/:id`)

Os cards do início abrem a página do jogo, com ou sem guia (`GamePage`, mesmo formato da leitura do guia):
hero (`DetailHero`, compartilhado com o `GuideHero`), "Sobre o jogo" (`GameAbout`, também na Visão geral do guia)
+ ficha e, à direita, o cartão do guia: **Ler guia** ou, sem guia, **Criar guia** (admin / sem Firebase).
Embaixo, os guias das DLCs (`GuideLinkList`, a mesma lista da leitura). O card guarda o jogo antes de navegar
(`rememberGame`): a página abre na hora e só busca o que falta (resumo). A leitura do guia tem "Ver página do jogo".

## Detalhes extras do jogo e dos troféus

- **IGDB (`getById`, 3 consultas em paralelo, 24 h de cache):** `backdrop` (artwork horizontal → fundo do topo,
  `backdropSrc`), `trailer` (YouTube → botão Trailer da página do jogo), `timeToBeat` (`game_time_to_beats`:
  história, extras e 100%, em horas) e `related` (edições do mesmo jogo, remasters, remakes, ports, expansões e DLCs
  → "Outras versões e relacionados"). RAWG: `background_image_additional`, `playtime` (média) e sem relacionados.
- **Tempo do guia:** sem horas informadas no guia, o "Para platinar" mostra a estimativa de 100% (marcada como estimativa).
- **Cópia do jogo no guia:** guarda também fundo, trailer e tempo; `detailed` = versão dos detalhes
  (`DETAIL_VERSION` em `src/utils/guideDraft.js`) → cópias antigas são completadas uma vez.
- **PSN:** troféus de PS5 com contador trazem `target` (ex.: 50) e o seu `progress` (ex.: 32) → etiqueta
  "Andamento: 32/50" (ou "Meta: 50"); troféus com recompensa trazem `reward` → "Recompensa: …".
  `TROPHY_LIST_VERSION` = 3 (caches antigos da lista são ignorados).

## Trocar o jogo do guia

O id do guia é o id do jogo (`rawg-123`, `igdb-456`). No editor, o botão ⇄ do card do jogo num guia com conteúdo abre
`ChangeGameModal`: escolhe o jogo novo (ex.: a edição Director's Cut) e `useMoveGuide` muda o guia de id — dicas,
abas, listas da PSN e status vão junto, e os guias das DLCs viram `novo~grupo`. Nuvem numa escrita só
(`moveGuides`: grava os novos e apaga os antigos), depois o navegador (rascunhos + coletáveis marcados).
Não sobrescreve: se o jogo escolhido já tem guia, avisa. Guia vazio: o ⇄ só volta para a escolha do jogo.

## Apagar guia

Em **Meus guias** (lixeira no card) ou no **editor** (menu ⋯ → Apagar guia). O modal (`DeleteGuideModal`) confirma e
`useDeleteGuide` apaga da nuvem numa escrita só (`deleteGuides`, só o admin — `firestore.rules`) e depois deste
navegador (rascunho + coletáveis marcados — `deleteDraft`). O guia de um jogo leva junto os guias das DLCs dele.
Com o Firebase configurado, sem admin não apaga (o guia voltaria da nuvem no próximo login). No editor, `discard()`
cancela as gravações pendentes antes de sair, para nada recriar o guia.

## Backup dos guias

Meus guias → **Backup**: **Exportar todos (.json)** baixa `must-guide-backup-AAAA-MM-DD.json` com os guias completos
(nuvem + navegador, a cópia mais recente de cada — `utils/backup.js`). **Importar backup…** lê o arquivo, ignora
o que não for guia válido e mostra o que muda em cada um (Novo / Mais novo / Igual / Mais antigo que o atual); entram
os novos e os mais novos, e os mais antigos só se marcar. Grava na nuvem numa escrita só (`saveGuides`, admin) e
no navegador (`useBackup`). Com o Firebase configurado, sem admin não importa.

## Rascunho do guia

O guia em edição fica sempre no navegador (`localStorage`, chave `mg:guide-draft:<guideId>`) e, com o admin logado,
também no Firestore. Ao abrir, vale a cópia mais recente (`updatedAt`): a da nuvem substitui a local, ou a local
(editada sem internet ou antes do login) sobe. Gravação: navegador em 600 ms, nuvem agrupada em 2,5 s e ao sair.
Formato (`src/utils/guideDraft.js`):

```js
{ guideId, gameId, parentId?, dlc?: { groupId, name, icon }, game, status: 'draft' | 'published', publishedAt, tabs: [], versions: [{ id, name, platform, service }],
  trophies: { [trophyId]: { tip, when, difficulty, chapter, video, story, missable, online } },
  stats: { difficulty, playthroughs, hours },
  guide: [{ id, title, body, trophies }], roadmap, tips, collectibles, walkthrough, missables, online: [mesmo formato],
  updatedAt }   // visão geral no cabeçalho da aba Troféus (0 = não informado; config/guide.js)
```

- `versions[0]` é a versão principal; as anotações valem para todas (ligadas pelo `trophyId`).
- Formato completo da anotação em `EMPTY_NOTE` (`src/config/trophies.js`); só os campos preenchidos são gravados.
- `when` = momento (`TROPHY_MOMENTS`), `difficulty` = 1–5, `chapter` = capítulo/missão, `video` = link.
- `tip` = HTML do "Como conseguir" (editor Pell; filtrado ao colar, ao fechar e ao exibir — `src/utils/html.js`). As marcações (História, Perdível, Online) vêm de `TROPHY_FLAGS` em `src/config/trophies.js`: para criar outra, basta adicionar lá (botão e filtro aparecem sozinhos).

## Editor de texto (Pell)

`src/components/ui/RichTextEditor.vue` (v-model = HTML). Os botões ficam em `src/config/editor.js`:
`name` igual a um botão do Pell (`bold`, `italic`, `ulist`, `olist`, `quote`, `code`…) reaproveita o comportamento;
para um botão novo, informe `result()` e, se tiver estado ligado/desligado, `state()`. Ícones vêm do lucide.

**Referência a troféu:** botão de troféu na barra ou digitar `@` no texto → escolhe o troféu → entra um chip.
**Linkar um nome já escrito:** selecione o trecho (ex.: "Bounty Hunter") e toque no botão de troféu ou aperte
**Ctrl/⌘+K** → a lista abre já buscando o trecho (nome igual em PT ou EN vem primeiro) → o trecho vira o chip,
mantendo o texto que você escreveu.
**Linkar automaticamente (varinha):** acha no texto todos os nomes de troféus já escritos (PT ou EN, palavra
inteira, sem diferenciar maiúsculas, aspas ' e ’ iguais, nome mais longo primeiro) e transforma em chips de uma vez;
ignora o que já é link. O aviso mostra quantos foram e tem **Desfazer**. Lógica em `autoLinkTrophies` (`src/utils/trophyRef.js`).
Formato do chip
`<a href="#trofeu-ID" data-trophy="ID" data-type="gold" class="trophy-ref" contenteditable="false">Nome</a>`.
Na leitura, tocar no chip rola até o troféu (tira o filtro) e destaca. Vale nas versões PS4/PS5 (mesmo `trophyId`).
Cada troféu mostra **"Citado em:"** com os troféus que o mencionam (calculado das anotações em `useTrophyNotes` → `backlinks`).

**Barra customizável:** `RefTextEditor` recebe `tools` — o nome de um conjunto de `EDITOR_TOOLSETS`
(`src/config/editor.js`) ou a lista de botões. `full` (padrão, abas de seções), `tip` (dica do troféu: sem subtítulo
nem cartão) e `collectible` ("como achar": negrito, itálico, link, limpar, spoiler, controle, troféu e coletável).
A ordem é sempre a da barra completa; sem `trophyRef`, o "@" e o Ctrl+K não citam troféu.
Ex.: `<RefTextEditor v-model="texto" :tools="['bold', 'italic', 'controllerKey']" />`.
## Marca (logo, ícones, compartilhamento)

| Arquivo | Uso |
|---|---|
| `public/brand/logo.svg` · `logo-dark.svg` · `logo-mono.svg` | logo vetorizado (cores · fundo escuro · uma cor) |
| `public/brand/mark.svg` | símbolo (só o "G") |
| `public/favicon.svg` · `favicon.ico` (16/32/48) | favicon |
| `public/apple-touch-icon.png` (180) · `public/icons/*` (192, 512, maskable) | tela inicial / app instalado (`manifest.webmanifest`) |
| `public/og-image.jpg` (1200×630) | prévia ao compartilhar o link (`og:image`) |
| `src/components/layout/AppLogo.vue` | logo no app, cores pelo tema (`--logo-primary`, `--logo-accent`) |

Cores: terracota `#C96442` (escuro: `#D97757`) e laranja `#FF914D`. A URL do site para as tags de compartilhamento tem padrão no `vite.config.js` (`DEFAULT_SITE_URL`) e pode ser trocada por `VITE_SITE_URL` no `.env.local`.

## Dificuldade do guia (1–10)

Faixas em `DIFFICULTY_BANDS` (`src/config/guide.js`): 1–2 Fácil (verde) · 3–5 Média (amarelo) · 6–8 Difícil (vermelho) · 9–10 Extrema (preto).
`difficultyClass(n)` (`src/utils/difficulty.js`) devolve `diff--<faixa>`, que só define `--diff-bg`/`--diff-fg`
(`src/styles/components/_difficulty.scss`), então qualquer elemento pode usar a cor.

## Modais

`BaseModal` (v-model, `title`, `description`, `wide`, slot `#footer`): no celular sobe de baixo e fecha arrastando;
Esc, tocar fora e o "voltar" do celular fecham só o de cima (`useModalStack`); o foco entra no modal e volta ao fechar.

## Navegação

Igual ao Must Watch: barra flutuante no topo (logo · abas · tema e conta) e, no celular, barra flutuante
embaixo (só ícones; a aba ativa mostra o nome; a última é a Conta). As duas somem ao rolar para baixo e voltam ao subir
(`useNavVisibility`). Abas em `src/config/navigation.js`. Espaços reservados em `src/styles/layout/_nav.scss`:
`--nav-space` (topo da página), `--nav-offset` (onde grudam elementos sticky; 0 com a barra escondida) e `--tabbar-space`.

## Dica ao passar o mouse

Qualquer elemento: `data-tooltip="Texto"` (+ `aria-label`). Encostado na direita: classe `tooltip-left`.
Estilo em `src/styles/components/_tooltip.scss` (só CSS; não aparece em telas de toque).

## PWA (instalar e usar sem internet)

No site gerado pelo build (`npm run build` → deploy, ou `npm run preview` para testar no PC), o app pode ser
instalado no celular ("Adicionar à tela inicial") e abre **sem internet** o que já foi visto:
- **Service worker** (`src/pwa/sw.js`, gerado no build por `vite/swPlugin.js` com a lista dos arquivos e a versão):
  guarda o app inteiro na instalação; navegação pela rede e, sem internet, o app guardado; `/api` (jogos e troféus)
  pela rede com a última resposta como reserva; imagens e fontes do cache (até 400). Cada deploy gera um `sw.js`
  novo → os caches antigos saem. No `npm run dev` não há service worker.
- **Guias lidos** (`readCache.service.js`): a cópia da nuvem de cada guia aberto fica no navegador (os últimos 30);
  sem internet, `useGuide` usa ela. Os rascunhos de quem edita já ficam no navegador.
- Sem internet aparece o aviso no rodapé (`OfflineBar`). Deploy novo com uma aba antiga aberta: se faltar um arquivo
  ao trocar de página, a página recarrega sozinha uma vez (`src/pwa/register.js`).
- `npm run preview` agora também responde `/api` (as mesmas chaves do `.env.local`), para testar o build completo.
- `firebase.json`: `/sw.js` com `no-cache` (o navegador sempre confere a versão nova).

## Testes

```bash
npm install                      # 1ª vez: vitest, jsdom e @playwright/test
npx playwright install chromium  # 1ª vez: o navegador dos testes de ponta a ponta
npm test                         # unidade (≈3 s): filtro do HTML, citações, páginas, backup, recorte da lista…
npm run test:e2e                 # ponta a ponta (≈1 min): o app de verdade num Chromium
npm run test:all                 # os dois — rode antes de cada commit
```

- **Unidade** (`tests/unit`, Vitest + jsdom): funções de `src/utils` — o que passa e o que sai no filtro do texto,
  varinha, troféu sozinho vira cartão, cópia do jogo, guia antigo → páginas, recorte jogo base/DLC, "onde aparece",
  plano do backup, busca no guia, numeração/resumo/créditos dos coletáveis.
- **Ponta a ponta** (`tests/e2e`, Playwright): DLC, Guia em páginas, ferramentas do texto (contador, cartão, botões
  PS/Xbox, caixa de aviso, spoiler, imagem), página do troféu, busca no guia, coletáveis (filtro, compacto, créditos), checklist, apagar, trocar o jogo, backup e página do jogo.
- **Sem internet e sem as suas chaves:** `playwright.config.js` sobe o Vite com `tests/mocks/vite.config.js`
  (Firebase de mentira no localStorage — `tests/mocks/firebase`) e simula RAWG, IGDB e PSN no servidor
  (`tests/mocks/network`, via `NODE_OPTIONS`). As variáveis do teste vencem o `.env.local`.
- Novo teste: copie um `*.spec.js` e use `seed(page, [guias])` / `yoteiGuide({...})` de `tests/e2e/helpers.js`.
  Falhou? O Playwright guarda print e contexto em `test-results/` (fora do git).

## Trocar de provedor de jogos

| Provedor | Chaves | Observações |
|---|---|---|
| RAWG | `RAWG_API_KEY` | capas horizontais (cortadas no card) · exige crédito com link (já exibido) |
| IGDB | `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` | app em dev.twitch.tv (exige 2FA) · capas verticais · busca traz edições, remasters, expansões e DLCs com rótulo (`kind`) |

1. Coloque as chaves no `.env.local` (dev) e no Secret Manager (`firebase functions:secrets:set NOME`).
2. Mude `GAMES_PROVIDER` (no `.env.local` ou no `functions/.env`, a partir do `functions/.env.example`).
3. Reinicie o `npm run dev` / rode `npm run deploy:functions`.

**Guias feitos com o outro provedor continuam abrindo.** O id do jogo leva o provedor (`rawg-123`, `igdb-456`), mas:
- o guia guarda uma cópia do jogo (`game`: título, capa, ano, plataformas, gêneros, resumo — `gameSnapshot` em
  `src/utils/guideDraft.js`) → editor e leitura usam a cópia, sem ir à API; cópia incompleta é completada em segundo plano;
- `/api/games/game/:id` usa o provedor do prefixo do id quando a chave dele também está no `.env.local`;
- ao escolher um jogo em "Criar guia", se já existir guia com o mesmo nome (de outro provedor), abre o existente
  (com a opção "Criar outro").

## Utilitárias SCSS

Espaçamento em múltiplos de 8px (`1` = 8px): `p-2`, `px-3`, `mt-1`, `gap-2`, `gap-y-3`…
Layout: `d-flex`, `flex-column`, `align-center`, `justify-between`, `flex-1`, `d-md-none`…
Outras: `radius-1|2|3|full`, `text-muted`, `text-sm`, `fw-600`, `truncate`, `line-clamp-2`, `surface`.
Tokens e mixins (`space()`, `up(md)`, `$r1`…) já estão disponíveis em todo `<style lang="scss">`.
