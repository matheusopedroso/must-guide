import { escapeHtml } from './html';

// Coletável (aba Coletáveis, dentro de cada região/seção): nome, tipo ("Legacy Item"), local/checkpoint,
// descrição (texto simples) e imagens (links). O progresso (marcado ou não) é de cada pessoa — ver useCollected.
export const MAX_IMAGES = 4;

export const createCollectible = (name = '') => ({
  id: Math.random().toString(36).slice(2, 10),
  name,
  type: '',
  location: '',
  description: '',
  images: [],
});

export const collectibleAnchorId = (id) => `coletavel-${id}`;

// Chip no texto (mesma ideia do troféu): na leitura vira uma caixinha para marcar
export const collectibleRefHtml = (item, label = '') =>
  `<a href="#${collectibleAnchorId(item.id)}" data-collectible="${item.id}" class="collectible-ref" contenteditable="false">${escapeHtml(label || item.name || 'Coletável')}</a>`;

// Todos os coletáveis do guia, na ordem, com a região: [{ ...item, region }]
export const collectiblesOf = (guide) =>
  (guide?.collectibles ?? []).flatMap((s) => (s.items ?? []).map((item) => ({ ...item, region: s.title.trim() })));
