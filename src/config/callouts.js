import { Info, Lightbulb, OctagonAlert, TriangleAlert } from 'lucide-vue-next';

// Caixas de aviso no texto (como os guias do IGN/PSNProfiles): o parágrafo do cursor vira uma caixa
// <div class="callout" data-kind="…">. tone = cor (variáveis do tema); o rótulo aparece no topo da caixa
// (styles/components/_rich-text.scss, mesmos ids). Para um tipo novo: adicione aqui e no SCSS.
export const CALLOUTS = [
  { id: 'warning', label: 'Atenção', icon: TriangleAlert },
  { id: 'missable', label: 'Perdível', icon: OctagonAlert },
  { id: 'tip', label: 'Dica', icon: Lightbulb },
  { id: 'note', label: 'Nota', icon: Info },
];

export const CALLOUT_IDS = new Set(CALLOUTS.map((c) => c.id));
