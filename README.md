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
│     │  ├─ trophiesApi.js     rotas /api/trophies (titles, list, progress)
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
| `GET /api/trophies/list/:npId?service=` | grupos + troféus (pt-BR, com `nameEn` em inglês) de qualquer jogo | 1 h / 24 h |
| `GET /api/trophies/progress/:npId?service=` | conquistados, data e raridade na conta (`null` se não tem o jogo) | 1 min / sem CDN |

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
| Regras | `firestore.rules` (admin grava; publicado qualquer um lê) |
| Rotas pessoais da PSN | `/api/trophies/titles` e `progress` exigem token de admin em produção (`functions/src/auth.js`); no `npm run dev` ficam abertas |

O SDK só é baixado se o aparelho já teve login ou ao clicar em **Entrar** (quem só visita não carrega nada).

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

## Guia e Roadmap (abas de seções)

As duas abas usam o mesmo modelo, configurado em `src/config/guideTabs.js` (`sections`: onde guardar, nome da
seção, numerada ou não, textos de ajuda) e as mesmas peças (`SectionsTab` no editor, `SectionsView` na leitura,
`useSections`, `src/utils/sections.js`). Para criar outra aba assim, basta adicionar `component: SectionsTab` e `sections: {…}`.

| Aba | Fica em | Cada parte | Rótulo |
|---|---|---|---|
| **Guia** (fixa) | `guide` | Seção (Introdução, Dicas gerais…) | só o título |
| **Roadmap** (opcional) | `roadmap` | Etapa | "Etapa 1: título" |

Roadmap: a platina dividida em **etapas** (como o roadmap do PSNProfiles):
cada etapa tem título, texto corrido (mesmo editor do "Como conseguir": negrito, listas, links e `@` para citar
troféus) e os **troféus desta etapa** em grade. "Adicionar os N citados no texto" puxa para a lista os troféus
citados. No editor: subir/descer/remover etapa e quantos troféus já estão em alguma etapa.
Na leitura (`/guia/:id?aba=roadmap`): índice das etapas, texto e grade (conquistados em verde); tocar num troféu
abre a aba Troféus nele. Formato (as duas abas): `[{ id, title, body, trophies: [trophyId] }]` (`src/utils/sections.js`).
A leitura mostra a aba só se ela tiver alguma seção preenchida.

## Rascunho do guia

O guia em edição fica sempre no navegador (`localStorage`, chave `mg:guide-draft:<jogo>`) e, com o admin logado,
também no Firestore. Ao abrir, vale a cópia mais recente (`updatedAt`): a da nuvem substitui a local, ou a local
(editada sem internet ou antes do login) sobe. Gravação: navegador em 600 ms, nuvem agrupada em 2,5 s e ao sair.
Formato (`src/utils/guideDraft.js`):

```js
{ gameId, game, status: 'draft' | 'published', publishedAt, tabs: [], versions: [{ id, name, platform, service }],
  trophies: { [trophyId]: { tip, when, difficulty, chapter, video, story, missable, online } },
  stats: { difficulty, playthroughs, hours },
  guide: [{ id, title, body, trophies }], roadmap: [{ id, title, body, trophies }], updatedAt }   // visão geral no cabeçalho da aba Troféus (0 = não informado; config/guide.js)
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

## Trocar de provedor de jogos

| Provedor | Chaves | Observações |
|---|---|---|
| RAWG | `RAWG_API_KEY` | capas horizontais (cortadas no card) · exige crédito com link (já exibido) |
| IGDB | `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` | app em dev.twitch.tv (exige 2FA) · capas verticais |

1. Coloque as chaves no `.env.local` (dev) e no Secret Manager (`firebase functions:secrets:set NOME`).
2. Crie `functions/.env` a partir do `functions/.env.example` e mude `GAMES_PROVIDER`.
3. Reinicie o `npm run dev` / rode `npm run deploy:functions`.

## Utilitárias SCSS

Espaçamento em múltiplos de 8px (`1` = 8px): `p-2`, `px-3`, `mt-1`, `gap-2`, `gap-y-3`…
Layout: `d-flex`, `flex-column`, `align-center`, `justify-between`, `flex-1`, `d-md-none`…
Outras: `radius-1|2|3|full`, `text-muted`, `text-sm`, `fw-600`, `truncate`, `line-clamp-2`, `surface`.
Tokens e mixins (`space()`, `up(md)`, `$r1`…) já estão disponíveis em todo `<style lang="scss">`.
