import { BookOpen, TriangleAlert, Wifi } from 'lucide-vue-next';


// Tipos de troféu na ordem de exibição
export const TROPHY_TYPES = [
  { id: 'platinum', label: 'Platina', color: 'var(--trophy-platinum)' },
  { id: 'gold', label: 'Ouro', color: 'var(--trophy-gold)' },
  { id: 'silver', label: 'Prata', color: 'var(--trophy-silver)' },
  { id: 'bronze', label: 'Bronze', color: 'var(--trophy-bronze)' },
];

export const TROPHY_TYPE_MAP = Object.fromEntries(TROPHY_TYPES.map((t) => [t.id, t]));

export const NP_ID_PATTERN = /^NPWR\d{5}_\d{2}$/;

// trophyRare da PSN → rótulo
export const RARITY_LABELS = { 0: 'Ultra raro', 1: 'Muito raro', 2: 'Raro', 3: 'Comum' };

// Marcações que o guia pode dar a cada troféu (badges no card + botões em Detalhes + filtros).
// tone = cor do badge (classes .badge--* em styles/components/_controls.scss). Para criar uma nova, basta adicionar aqui.
export const TROPHY_FLAGS = [
  { id: 'story', label: 'História', icon: BookOpen, tone: 'info' },
  { id: 'missable', label: 'Perdível', icon: TriangleAlert, tone: 'danger' },
  { id: 'online', label: 'Online', icon: Wifi, tone: 'accent' },
];

// Em que momento do jogo o troféu sai (campo "when" da anotação)
export const TROPHY_MOMENTS = [
  { id: 'any', label: 'Qualquer momento' },
  { id: 'first', label: '1ª jogada' },
  { id: 'postgame', label: 'Pós-game' },
  { id: 'ngplus', label: 'NG+ / nova jogada' },
];
export const TROPHY_MOMENT_MAP = Object.fromEntries(TROPHY_MOMENTS.map((m) => [m.id, m]));

export const DIFFICULTY_MAX = 5;
export const DIFFICULTY_LABELS = { 1: 'Muito fácil', 2: 'Fácil', 3: 'Médio', 4: 'Difícil', 5: 'Muito difícil' };

// Anotação vazia de um troféu (formato completo). As marcações de TROPHY_FLAGS entram como false.
export const EMPTY_NOTE = Object.freeze({
  tip: '', // HTML "Como conseguir"
  when: '', // id de TROPHY_MOMENTS
  difficulty: 0, // 1..DIFFICULTY_MAX (0 = sem nota)
  chapter: '', // capítulo / missão
  video: '', // link de vídeo de referência
  ...Object.fromEntries(TROPHY_FLAGS.map((f) => [f.id, false])),
});
