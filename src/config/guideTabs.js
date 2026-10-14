import { BookOpen, Gem, Route, Trophy } from 'lucide-vue-next';

// Abas do editor de guia. Quando uma aba ganhar conteúdo, adicione:
// component: defineAsyncComponent(() => import('@/components/guide-editor/tabs/XxxTab.vue'))
export const GUIDE_TABS = [
  { id: 'trofeus', label: 'Troféus', icon: Trophy, description: 'Lista de troféus do jogo, com dicas de como conseguir cada um.' },
  { id: 'coletaveis', label: 'Coletáveis', icon: Gem, description: 'Itens colecionáveis organizados por capítulo ou área, com a localização.' },
  { id: 'guia', label: 'Guia', icon: BookOpen, description: 'Visão geral: dificuldade, tempo estimado, jogadas, perdíveis e roteiro.' },
  { id: 'detonado', label: 'Detonado', icon: Route, description: 'Passo a passo da história, do início ao fim.' },
];

export const DEFAULT_TAB = GUIDE_TABS[0].id;
