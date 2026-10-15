// Datas no padrão do app (pt-BR, fuso de quem vê)
const shortFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fullFmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'medium' });

// 09/10/2026
export const formatDate = (iso) => (iso ? shortFmt.format(new Date(iso)) : '');
// 9 de outubro de 2026 às 17:00:00
export const formatDateTime = (iso) => (iso ? fullFmt.format(new Date(iso)) : '');

// "agora", "há 5 minutos", "há 3 horas", "ontem", "há 4 dias"; mais de uma semana → 09/10/2026
const relFmt = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
export function timeAgo(iso, now = Date.now()) {
  if (!iso) return '';
  const sec = Math.round((Date.parse(iso) - now) / 1000);
  const abs = Math.abs(sec);
  if (abs < 60) return 'agora';
  if (abs < 3600) return relFmt.format(Math.round(sec / 60), 'minute');
  if (abs < 86400) return relFmt.format(Math.round(sec / 3600), 'hour');
  if (abs < 7 * 86400) return relFmt.format(Math.round(sec / 86400), 'day');
  return formatDate(iso);
}
