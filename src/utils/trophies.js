import { normalizeName } from './text';

const rateFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const dateFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatRate = (rate) => `${rateFmt.format(rate)}%`;
export const formatEarnedAt = (iso) => (iso ? dateFmt.format(new Date(iso)) : '');

// Compara a lista de uma versão com a principal. As anotações usam o trophyId,
// então só batem se cada id tiver o mesmo troféu nas duas listas.
export function compareVersions(principal, other) {
  const byId = new Map(principal.trophies.map((t) => [t.id, normalizeName(t.name)]));
  let different = Math.abs(principal.trophies.length - other.trophies.length);
  for (const t of other.trophies) {
    const name = byId.get(t.id);
    if (name === undefined || name !== normalizeName(t.name)) different++;
  }
  return { same: different === 0, different };
}
