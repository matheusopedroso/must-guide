import { House, SquarePen } from 'lucide-vue-next';

// Abas da navegação principal (barra do topo no PC e barra de baixo no celular).
// match(route) diz se a aba está ativa. Para uma aba nova, basta adicionar aqui.
export const NAV_ITEMS = [
  { id: 'home', label: 'Início', icon: House, to: { name: 'home' }, match: (r) => r.name === 'home' },
  {
    id: 'guide',
    label: 'Criar guia',
    short: 'Criar', // rótulo curto na barra do celular
    icon: SquarePen,
    to: { name: 'guide-new' },
    match: (r) => String(r.name ?? '').startsWith('guide'),
  },
];
