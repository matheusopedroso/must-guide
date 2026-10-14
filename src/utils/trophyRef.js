import { escapeHtml } from './html';

// Referência a outro troféu dentro do texto do guia.
// contenteditable="false": no editor vira um bloco único (apaga inteiro, não dá para editar o nome por dentro).
export const trophyRefHtml = (trophy) =>
  `<a href="#trofeu-${trophy.id}" data-trophy="${trophy.id}" data-type="${trophy.type}" class="trophy-ref" contenteditable="false">${escapeHtml(trophy.name || 'Troféu oculto')}</a>`;

export const trophyAnchorId = (id) => `trofeu-${id}`;

// ids dos troféus citados num texto (sem repetir)
const REF_PATTERN = /data-trophy="(\d+)"/g;
export const extractTrophyRefs = (html = '') => new Set([...html.matchAll(REF_PATTERN)].map((m) => Number(m[1])));
