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
