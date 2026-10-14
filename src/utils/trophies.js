import { normalizeName } from './text';
import { formatDate, formatDateTime } from './date';

const rateFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export const formatRate = (rate) => `${rateFmt.format(rate)}%`;
// Data curta (09/10/2026): o rodapé do troféu tem pouco espaço · completa com hora no tooltip
export const formatEarnedAt = formatDate;
export const formatEarnedAtFull = formatDateTime;

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
