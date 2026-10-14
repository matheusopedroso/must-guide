import { defineAsyncComponent } from 'vue';
import { BookOpen, Gem, Lightbulb, Milestone, PackagePlus, Route, TriangleAlert, Trophy, Wifi } from 'lucide-vue-next';

// Abas do guia. fixed = sempre presente; as demais a pessoa adiciona pelo botão "+ Aba".
// A ordem aqui é a ordem em que aparecem (no editor e na leitura). Quando uma aba ganhar conteúdo, adicione:
// component: defineAsyncComponent(() => import('@/components/guide-editor/tabs/XxxTab.vue'))
//
// Abas de texto em seções (Guia, Roadmap): `sections` configura o mesmo editor/leitura (SectionsTab/SectionsView).
//   key: onde ficam no rascunho · unit: nome de cada seção · masc: palavra masculina ("deste capítulo")
//   numbered: "Etapa 1: …" ou só o título · flag: marcação dos troféus (config/trophies → TROPHY_FLAGS) cujos
//   troféus aparecem sozinhos no topo da aba (Perdíveis, Online) · items: cada seção tem coletáveis (Coletáveis)
const SectionsTab = defineAsyncComponent(() => import('@/components/guide-editor/tabs/SectionsTab.vue'));
export const GUIDE_TABS = [
  {
    id: 'trofeus',
    label: 'Troféus',
    icon: Trophy,
    fixed: true,
    description: 'Lista de troféus do jogo, com dicas de como conseguir cada um.',
    component: defineAsyncComponent(() => import('@/components/guide-editor/tabs/TrophiesTab.vue')),
  },
  {
    id: 'guia',
    label: 'Guia',
    icon: BookOpen,
    fixed: true,
    description: 'O guia em texto: introdução, dicas gerais, o que saber antes de começar.',
    component: SectionsTab,
    sections: {
      key: 'guide',
      unit: 'Seção',
      numbered: false,
      titlePlaceholder: 'Título (ex.: Introdução, Antes de começar)',
      bodyPlaceholder: 'Escreva o guia. Digite @ para citar um troféu ou use a varinha para linkar os nomes…',
      emptyText: 'Divida o guia em seções (ex.: introdução, antes de começar, dicas gerais). Cada seção tem um texto e, se quiser, os troféus ligados a ela.',
    },
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    icon: Milestone,
    description: 'Ordem recomendada para a platina: etapas, o que fazer em cada jogada e quando pegar cada troféu.',
    component: SectionsTab,
    sections: {
      key: 'roadmap',
      unit: 'Etapa',
      numbered: true,
      titlePlaceholder: 'Título (ex.: Jogada da história)',
      bodyPlaceholder: 'O que fazer nesta etapa, em que ordem e o que não pode perder. Digite @ para citar um troféu…',
      emptyText: 'Divida a platina em etapas (ex.: jogada da história, limpeza, troféus diversos). Cada etapa tem um texto e os troféus que saem nela.',
    },
  },
  {
    id: 'coletaveis',
    label: 'Coletáveis',
    icon: Gem,
    description: 'Itens colecionáveis por capítulo ou área, com a localização.',
    component: SectionsTab,
    sections: {
      key: 'collectibles',
      unit: 'Região',
      numbered: false,
      items: true, // cada região tem a lista de coletáveis (cartões com caixa de marcar)
      titlePlaceholder: 'Região ou capítulo (ex.: Capítulo 3, Floresta de Ezo)',
      bodyPlaceholder: 'Introdução da região (opcional): o que tem aqui, ordem para pegar. Digite @ para citar um troféu…',
      emptyText:
        'Separe os coletáveis por região ou capítulo. Cada coletável tem tipo, local, como achar e imagens, e quem lê vai marcando o que já pegou — também direto no Detonado e no Roadmap, citando o coletável no texto (botão da joia).',
    },
  },
  {
    id: 'detonado',
    label: 'Detonado',
    icon: Route,
    description: 'Passo a passo da história, do início ao fim.',
    component: SectionsTab,
    sections: {
      key: 'walkthrough',
      unit: 'Capítulo',
      masc: true,
      numbered: true,
      titlePlaceholder: 'Nome do capítulo ou missão',
      bodyPlaceholder: 'Passo a passo deste capítulo: o que fazer, segredos e troféus pelo caminho. Digite @ para citar um troféu…',
      emptyText: 'O passo a passo da história, capítulo por capítulo, com os troféus que saem em cada um.',
    },
  },
  {
    id: 'perdiveis',
    label: 'Perdíveis',
    icon: TriangleAlert,
    description: 'Troféus e itens que deixam de ser possíveis depois de certo ponto.',
    component: SectionsTab,
    sections: {
      key: 'missables',
      unit: 'Seção',
      numbered: false,
      flag: 'missable',
      titlePlaceholder: 'Título (ex.: Antes do capítulo 5, Ponto sem volta)',
      bodyPlaceholder: 'O que pode ser perdido e até quando dá para pegar. Digite @ para citar um troféu…',
      emptyText: 'Explique o que pode ser perdido e até quando. Os troféus marcados como Perdível na aba Troféus já aparecem sozinhos no topo.',
    },
  },
  {
    id: 'online',
    label: 'Online',
    icon: Wifi,
    description: 'Troféus online: requisitos, dicas e se os servidores ainda funcionam.',
    component: SectionsTab,
    sections: {
      key: 'online',
      unit: 'Seção',
      numbered: false,
      flag: 'online',
      titlePlaceholder: 'Título (ex.: Servidores, Como achar partida)',
      bodyPlaceholder: 'Requisitos, se os servidores ainda funcionam e como pegar os troféus online. Digite @ para citar um troféu…',
      emptyText: 'Requisitos e dicas dos troféus online. Os troféus marcados como Online na aba Troféus já aparecem sozinhos no topo.',
    },
  },
  {
    id: 'dlc',
    label: 'DLCs',
    icon: PackagePlus,
    description: 'Cada DLC com troféus vira um guia separado (troféus, guia, roadmap próprios), ligado a este.',
    gameOnly: true, // não existe dentro de um guia de DLC
    component: defineAsyncComponent(() => import('@/components/guide-editor/tabs/DlcTab.vue')),
  },
  {
    id: 'dicas',
    label: 'Dicas',
    icon: Lightbulb,
    description: 'Truques, builds e atalhos que facilitam a platina.',
    component: SectionsTab,
    sections: {
      key: 'tips',
      unit: 'Dica',
      numbered: false,
      titlePlaceholder: 'Título (ex.: Melhor build, Farm de dinheiro)',
      bodyPlaceholder: 'Explique a dica: o que fazer, onde e por que ajuda. Digite @ para citar um troféu…',
      emptyText: 'Truques, builds e atalhos que facilitam a platina. Cada dica tem um texto e, se quiser, os troféus que ela ajuda a pegar.',
    },
  },
];

export const DEFAULT_TAB = GUIDE_TABS[0].id;

// Abas de seções que a leitura mostra: fixa ou ativada no guia, e com alguma seção preenchida
export const sectionTabsOf = (guide) =>
  GUIDE_TABS.filter((t) => t.sections && (t.fixed || guide?.tabs?.includes(t.id)));
