import { DIFFICULTY_BANDS } from '@/config/guide';

// Faixa de uma nota de dificuldade (1–10) ou null se não informada
export const difficultyBand = (n) => (n > 0 ? (DIFFICULTY_BANDS.find((b) => n <= b.max) ?? null) : null);

// Classe de cor (.diff--easy…) para usar em qualquer elemento
export const difficultyClass = (n) => {
  const band = difficultyBand(n);
  return band ? `diff--${band.id}` : '';
};
