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

// Marcações que o guia pode dar a cada troféu (botões no troféu + filtros da lista).
// Para criar uma nova, basta adicionar aqui.
export const TROPHY_FLAGS = [
  { id: 'story', label: 'História', icon: BookOpen },
  { id: 'missable', label: 'Perdível', icon: TriangleAlert },
  { id: 'online', label: 'Online', icon: Wifi },
];
