// Tipos de troféu na ordem de exibição
export const TROPHY_TYPES = [
  { id: 'platinum', label: 'Platina', color: 'var(--trophy-platinum)' },
  { id: 'gold', label: 'Ouro', color: 'var(--trophy-gold)' },
  { id: 'silver', label: 'Prata', color: 'var(--trophy-silver)' },
  { id: 'bronze', label: 'Bronze', color: 'var(--trophy-bronze)' },
];

export const TROPHY_TYPE_MAP = Object.fromEntries(TROPHY_TYPES.map((t) => [t.id, t]));

export const NP_ID_PATTERN = /^NPWR\d{5}_\d{2}$/;
