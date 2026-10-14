import { Clock, Gauge, Repeat } from 'lucide-vue-next';

// Visão geral do guia (cabeçalho da aba Troféus, editada no GuideStatsModal). 0 = não informado.
export const GUIDE_STATS = [
  { id: 'difficulty', label: 'Dificuldade', icon: Gauge, suffix: '/10', min: 1, max: 10 },
  { id: 'playthroughs', label: 'Jogadas', icon: Repeat, suffix: '×', min: 1, max: 20 },
  { id: 'hours', label: 'Horas', icon: Clock, suffix: 'h', min: 1, max: 999 },
];

// Faixas de dificuldade (1–10): cor e nome. `max` = última nota da faixa.
// Cores em styles/components/_difficulty.scss (classe .diff--<id>).
export const DIFFICULTY_BANDS = [
  { id: 'easy', label: 'Fácil', max: 2 },
  { id: 'medium', label: 'Média', max: 5 },
  { id: 'hard', label: 'Difícil', max: 8 },
  { id: 'extreme', label: 'Extrema', max: 10 },
];
