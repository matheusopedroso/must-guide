const dateFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDate = (d) => (d instanceof Date ? dateFmt.format(d) : '');

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export const normalizeText = (s = '') =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
