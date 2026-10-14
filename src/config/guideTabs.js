import { defineAsyncComponent } from 'vue';
import { BookOpen, Gem, Lightbulb, Milestone, PackagePlus, Route, TriangleAlert, Trophy, Wifi } from 'lucide-vue-next';

// Abas do guia. fixed = sempre presente; as demais a pessoa adiciona pelo botão "+ Aba".
// A ordem aqui é a ordem em que aparecem (no editor e na leitura). Quando uma aba ganhar conteúdo, adicione:
// component: defineAsyncComponent(() => import('@/components/guide-editor/tabs/XxxTab.vue'))
//
// Abas de texto em seções (Guia, Roadmap): `sections` configura o mesmo editor/leitura (SectionsTab/SectionsView).
//   key: onde ficam no rascunho · unit: nome de cada seção · numbered: "Etapa 1: …" ou só o título
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
  { id: 'coletaveis', label: 'Coletáveis', icon: Gem, description: 'Itens colecionáveis por capítulo ou área, com a localização.' },
  { id: 'detonado', label: 'Detonado', icon: Route, description: 'Passo a passo da história, do início ao fim.' },
  { id: 'perdiveis', label: 'Perdíveis', icon: TriangleAlert, description: 'Troféus e itens que deixam de ser possíveis depois de certo ponto.' },
  { id: 'online', label: 'Online', icon: Wifi, description: 'Troféus online: requisitos, dicas e se os servidores ainda funcionam.' },
  { id: 'dlc', label: 'DLCs', icon: PackagePlus, description: 'Troféus e conteúdo das expansões.' },
  { id: 'dicas', label: 'Dicas', icon: Lightbulb, description: 'Truques, builds e atalhos que facilitam a platina.' },
];

export const DEFAULT_TAB = GUIDE_TABS[0].id;

// Abas de seções que a leitura mostra: fixa ou ativada no guia, e com alguma seção preenchida
export const sectionTabsOf = (guide) =>
  GUIDE_TABS.filter((t) => t.sections && (t.fixed || guide?.tabs?.includes(t.id)));
