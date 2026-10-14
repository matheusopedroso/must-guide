import { House, LibraryBig, SquarePen } from 'lucide-vue-next';

// Abas da navegação principal (barra do topo no PC e barra de baixo no celular).
// match(route) diz se a aba está ativa. Para uma aba nova, basta adicionar aqui.
const is = (...names) => (r) => names.includes(r.name);

export const NAV_ITEMS = [
  { id: 'home', label: 'Início', icon: House, to: { name: 'home' }, match: is('home') },
  { id: 'guides', label: 'Meus guias', short: 'Guias', icon: LibraryBig, to: { name: 'my-guides' }, match: is('my-guides', 'guide-view') },
  { id: 'new', label: 'Criar guia', short: 'Criar', icon: SquarePen, to: { name: 'guide-new' }, match: is('guide-new', 'guide-edit') },
];
