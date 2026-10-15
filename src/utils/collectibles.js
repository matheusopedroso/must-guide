import { escapeHtml } from './html';
import { normalizeUrl } from './url';

// Coletável (aba Coletáveis, dentro de cada região/seção): nome, tipo ("Artefato"), local/checkpoint,
// descrição (texto simples), imagens (links), vídeo (YouTube com tempo), marcas (perdível / não conta para o troféu)
// e crédito de quem fez as imagens/vídeo. O progresso (marcado ou não) é de cada pessoa — ver usePersonalProgress.
export const MAX_IMAGES = 4;

export const createCollectible = (name = '') => ({
  id: Math.random().toString(36).slice(2, 10),
  name,
  type: '',
  location: '',
  description: '',
  images: [],
  video: '',
  missable: false, // some se passar do ponto (sem seleção de capítulo)
  uncounted: false, // aparece no jogo, mas não conta para o troféu/contador
  credit: null, // { name, url } — imagens/vídeo de outra pessoa
  samePlace: false, // pego no mesmo lugar do anterior ("Artefato #1 + Artefato #2"): um cartão só, local/imagens do anterior
});

export const collectibleAnchorId = (id) => `coletavel-${id}`;

// Chip no texto (mesma ideia do troféu): na leitura vira uma caixinha para marcar
export const collectibleRefHtml = (item, label = '') =>
  `<a href="#${collectibleAnchorId(item.id)}" data-collectible="${item.id}" class="collectible-ref" contenteditable="false">${escapeHtml(label || item.name || 'Coletável')}</a>`;

// Numeração por tipo no guia todo, na ordem (como o contador do jogo e o PowerPyx: "Artefato #4").
// Os que não contam ficam sem número. Sem tipo = um grupo só (numeração geral).
// → Map id → { n, of }
export function numberCollectibles(items) {
  const totals = new Map();
  for (const it of items) if (!it.uncounted) totals.set(it.type ?? '', (totals.get(it.type ?? '') ?? 0) + 1);
  const seen = new Map();
  const numbers = new Map();
  for (const it of items) {
    if (it.uncounted) continue;
    const key = it.type ?? '';
    const n = (seen.get(key) ?? 0) + 1;
    seen.set(key, n);
    numbers.set(it.id, { n, of: totals.get(key) });
  }
  return numbers;
}

// Todos os coletáveis do guia, na ordem, com a região e o número: [{ ...item, region, regionId, n, of }]
export function collectiblesOf(guide) {
  const items = (guide?.collectibles ?? []).flatMap((s) =>
    (s.items ?? []).map((item) => ({ ...item, region: s.title.trim(), regionId: s.id })),
  );
  const numbers = numberCollectibles(items);
  return items.map((it) => ({ ...it, ...numbers.get(it.id) }));
}

// Coletáveis da mesma região juntos no mesmo cartão: o "mesmo lugar do anterior" entra no grupo de cima
// (o 1º da lista nunca é seguidor). items: de UMA região, na ordem → [[líder, ...seguidores]]
export function groupCollectibles(items) {
  const groups = [];
  for (const it of items) {
    if (it.samePlace && groups.length) groups[groups.length - 1].push(it);
    else groups.push([it]);
  }
  return groups;
}

// Grupo (cartão) de um coletável, entre todos os do guia (collectiblesOf) → [líder, ...] ou null
export function groupOf(all, id) {
  const item = all.find((i) => i.id === id);
  if (!item) return null;
  return groupCollectibles(all.filter((i) => i.regionId === item.regionId)).find((g) => g.some((i) => i.id === id));
}

// Resumo por tipo (na ordem em que aparecem): [{ type, total, done }]. Só os que contam.
export function summarizeByType(items, isDone = () => false) {
  const byType = new Map();
  for (const it of items) {
    if (it.uncounted) continue;
    const key = it.type ?? '';
    const row = byType.get(key) ?? { type: key, total: 0, done: 0 };
    row.total++;
    if (isDone(it.id)) row.done++;
    byType.set(key, row);
  }
  return [...byType.values()];
}

// Rótulo do coletável com o número: "Artefato #4" · sem tipo: "#4" · não conta: só o tipo
export const collectibleTag = (it) => [it.type, it.n ? `#${it.n}` : ''].filter(Boolean).join(' ');

// Filtro da leitura: '' (todos) · 'missable' · 'type:<tipo>'
export function matchesFilter(it, filter) {
  if (!filter) return true;
  if (filter === 'missable') return !!it.missable;
  return filter.startsWith('type:') && !it.uncounted && (it.type ?? '') === filter.slice(5);
}

// --- Créditos (guia e coletáveis) ---
// Crédito do guia: { id, name, url, role } — quem ajudou (imagens, rota, vídeo…)
export const createCredit = () => ({ id: Math.random().toString(36).slice(2, 10), name: '', url: '', role: '' });

export const cleanCredit = (c) => {
  const name = (c?.name ?? '').trim();
  return name ? { name, url: normalizeUrl(c.url ?? '') } : null;
};

// Créditos para a leitura: os do guia + os nomes citados nos coletáveis que não estão na lista
// (entram com o papel "Imagens/vídeos dos coletáveis"). Mesmo nome, sem diferença de maiúsculas = um só.
export function creditsOf(guide) {
  const list = (guide?.credits ?? []).filter((c) => c.name?.trim()).map((c) => ({ ...c, name: c.name.trim(), url: normalizeUrl(c.url ?? '') }));
  const known = new Set(list.map((c) => c.name.toLowerCase()));
  for (const it of collectiblesOf(guide)) {
    const c = cleanCredit(it.credit);
    if (!c || known.has(c.name.toLowerCase())) continue;
    known.add(c.name.toLowerCase());
    list.push({ id: `item-${it.id}`, ...c, role: 'Imagens/vídeos dos coletáveis' });
  }
  return list;
}

// --- Adicionar em massa (editor): colar uma lista, uma linha por coletável ---
// Aceita "Nome", "Tipo: Nome", "Tipo #3: Nome" (PowerPyx) e marcadores de lista ("- ", "• ", "1. ").
// Vários na mesma linha com " + " ("Artifact #1: Pamphlet + Artifact #2: Map") = pegos no mesmo lugar:
// o 2º em diante entra com samePlace. Linha sem tipo usa o padrão (o tipo escolhido no campo).
// → [{ name, type, samePlace }]
const BULLET = /^\s*(?:[-–•*]|\d+[.)])\s+/;
const TYPED = /^([^:#]{1,40}?)\s*(?:#\s*\d+)?\s*:\s*(.+)$/;

export function parseCollectibleLines(text = '', defaultType = '') {
  const out = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(BULLET, '').trim();
    if (!line) continue;
    line.split(/\s\+\s/).forEach((part, i) => {
      const m = part.trim().match(TYPED);
      const name = (m ? m[2] : part).trim();
      if (name) out.push({ name, type: (m ? m[1] : defaultType).trim(), samePlace: i > 0 });
    });
  }
  return out;
}
