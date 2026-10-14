import { defineAsyncComponent } from 'vue';
import { BookOpen, Gem, Lightbulb, Milestone, PackagePlus, Route, TriangleAlert, Trophy, Wifi } from 'lucide-vue-next';

// Abas do guia. fixed = sempre presente; as demais a pessoa adiciona pelo botão "+ Aba".
// A ordem aqui é a ordem em que aparecem. Quando uma aba ganhar conteúdo, adicione:
// component: defineAsyncComponent(() => import('@/components/guide-editor/tabs/XxxTab.vue'))
export const GUIDE_TABS = [
  {
    id: 'trofeus',
    label: 'Troféus',
    icon: Trophy,
    fixed: true,
    description: 'Lista de troféus do jogo, com dicas de como conseguir cada um.',
    component: defineAsyncComponent(() => import('@/components/guide-editor/tabs/TrophiesTab.vue')),
  },
  { id: 'guia', label: 'Guia', icon: BookOpen, fixed: true, description: 'Visão geral: dificuldade, tempo estimado, jogadas e roteiro.' },
  {
    id: 'roadmap',
    label: 'Roadmap',
    icon: Milestone,
    description: 'Ordem recomendada para a platina: etapas, o que fazer em cada jogada e quando pegar cada troféu.',
    component: defineAsyncComponent(() => import('@/components/guide-editor/tabs/RoadmapTab.vue')),
  },
  { id: 'coletaveis', label: 'Coletáveis', icon: Gem, description: 'Itens colecionáveis por capítulo ou área, com a localização.' },
  { id: 'detonado', label: 'Detonado', icon: Route, description: 'Passo a passo da história, do início ao fim.' },
  { id: 'perdiveis', label: 'Perdíveis', icon: TriangleAlert, description: 'Troféus e itens que deixam de ser possíveis depois de certo ponto.' },
  { id: 'online', label: 'Online', icon: Wifi, description: 'Troféus online: requisitos, dicas e se os servidores ainda funcionam.' },
  { id: 'dlc', label: 'DLCs', icon: PackagePlus, description: 'Troféus e conteúdo das expansões.' },
  { id: 'dicas', label: 'Dicas', icon: Lightbulb, description: 'Truques, builds e atalhos que facilitam a platina.' },
];

export const DEFAULT_TAB = GUIDE_TABS[0].id;
