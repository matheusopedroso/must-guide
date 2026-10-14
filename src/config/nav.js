import { Library, BookOpen } from 'lucide-vue-next';

export const NAV_ITEMS = [
  { to: '/', label: 'Biblioteca', icon: Library, match: ['library', 'game'] },
  { to: '/guides', label: 'Guias', icon: BookOpen, match: ['guides', 'guide', 'guide-edit', 'guide-new'] },
];
