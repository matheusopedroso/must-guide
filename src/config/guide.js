import { Clock, Gauge, Repeat } from 'lucide-vue-next';

// Visão geral do guia (dificuldade/jogadas/horas no cabeçalho da aba Troféus). 0 = não informado.
export const GUIDE_STATS = [
  { id: 'difficulty', label: 'Dificuldade', icon: Gauge, suffix: '/10', min: 1, max: 10 },
  { id: 'playthroughs', label: 'Jogadas', icon: Repeat, suffix: '×', min: 1, max: 20 },
  { id: 'hours', label: 'Horas', icon: Clock, suffix: 'h', min: 1, max: 999 },
];
