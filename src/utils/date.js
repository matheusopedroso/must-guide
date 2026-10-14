// Datas no padrão do app (pt-BR, fuso de quem vê)
const shortFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fullFmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'medium' });

// 09/10/2026
export const formatDate = (iso) => (iso ? shortFmt.format(new Date(iso)) : '');
// 9 de outubro de 2026 às 17:00:00
export const formatDateTime = (iso) => (iso ? fullFmt.format(new Date(iso)) : '');
