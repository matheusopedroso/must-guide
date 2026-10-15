import { escapeAttr, escapeHtml } from './html';

// Blocos de mídia no texto do guia (fora dos troféus): imagem com legenda.
// Imagem no texto (bloco entre os parágrafos), com legenda opcional
export function imageBlockHtml({ src, caption = '' }) {
  const alt = escapeAttr(caption.slice(0, 200));
  const cap = caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : '';
  return `<figure class="guide-img" contenteditable="false"><img src="${escapeAttr(src)}" alt="${alt}" loading="lazy">${cap}</figure>`;
}

// Versão grande da imagem (abre ao tocar na leitura): IGDB tem tamanhos no endereço
export const fullImageSrc = (src) => src.replace(/\/t_screenshot_big\//, '/t_1080p/');

