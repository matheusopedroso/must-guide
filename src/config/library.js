import { Bookmark, Gamepad2, Trophy } from 'lucide-vue-next';

// Status da biblioteca pessoal (ordem = ordem das abas e do menu). tone = cor do badge (.badge--*).
export const LIBRARY_STATUSES = [
  { id: 'playing', label: 'Jogando', icon: Gamepad2, tone: 'info' },
  { id: 'want', label: 'Quero platinar', icon: Bookmark, tone: 'accent' },
  { id: 'platinum', label: 'Platinado', icon: Trophy, tone: 'success' },
];

export const LIBRARY_STATUS_MAP = Object.fromEntries(LIBRARY_STATUSES.map((s) => [s.id, s]));
