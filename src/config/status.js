// Status da biblioteca — ordem = ordem dos filtros
export const GAME_STATUS = [
  { id: 'playing', label: 'Jogando', color: 'var(--info)' },
  { id: 'backlog', label: 'Na fila', color: 'var(--text-subtle)' },
  { id: 'completed', label: 'Zerado', color: 'var(--success)' },
  { id: 'platinum', label: 'Platinado', color: 'var(--platinum)' },
  { id: 'dropped', label: 'Abandonado', color: 'var(--danger)' },
];

export const DEFAULT_STATUS = 'backlog';

export const STATUS_MAP = Object.fromEntries(GAME_STATUS.map((s) => [s.id, s]));

export const GUIDE_STATUS = {
  draft: 'Rascunho',
  published: 'Publicado',
};
