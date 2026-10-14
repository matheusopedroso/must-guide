// Links digitados pelo usuário (vídeo de referência etc.)

// Completa "youtu.be/x" → "https://youtu.be/x"; só aceita http(s)
export function normalizeUrl(value = '') {
  const v = value.trim();
  if (!v) return '';
  const url = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    return new URL(url).href;
  } catch {
    return '';
  }
}

export const isYoutube = (url = '') => /(^|\.)(youtube\.com|youtu\.be)$/i.test(safeHost(url));

function safeHost(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

// "1h2m3s", "90s", "90" → segundos
function parseTime(value) {
  if (!value) return 0;
  if (/^\d+$/.test(value)) return Number(value);
  const m = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  return m ? (Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0)) : 0;
}

// Link do YouTube → { id, start } para tocar dentro do app. Outros sites → null (abrem em nova aba).
// Aceita: watch?v=, youtu.be/, shorts/, embed/, live/ e tempo em t= ou start=
export function parseYoutube(value = '') {
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (!isYoutube(value)) return null;

  const path = url.pathname.split('/').filter(Boolean);
  const id =
    url.hostname.endsWith('youtu.be') ? path[0]
    : path[0] === 'watch' ? url.searchParams.get('v')
    : ['shorts', 'embed', 'live'].includes(path[0]) ? path[1]
    : null;

  if (!id || !/^[\w-]{11}$/.test(id)) return null;
  return { id, start: parseTime(url.searchParams.get('t') ?? url.searchParams.get('start')) };
}

// Endereço do player (modo sem cookies do YouTube)
export const youtubeEmbedUrl = ({ id, start }) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1${start ? `&start=${start}` : ''}`;
