import { describe, expect, it } from 'vitest';
import { makeBackup, parseBackup, planImport } from '@/utils/backup';

const guide = (id, updatedAt) => ({ guideId: id, gameId: id.split('~')[0], game: { id, title: id }, updatedAt });

describe('backup', () => {
  it('lê só backup do Must Guide e ignora itens inválidos', () => {
    const text = JSON.stringify({ ...makeBackup([guide('rawg-1', '2026-01-01')]), guides: [guide('rawg-1', '2026-01-01'), { guideId: '../x' }] });
    const { guides, skipped } = parseBackup(text);
    expect(guides).toHaveLength(1);
    expect(skipped).toBe(1);
    expect(() => parseBackup('{"x":1}')).toThrow('não é um backup');
    expect(() => parseBackup('nada')).toThrow('JSON');
  });

  it('planImport compara com os atuais', () => {
    const current = new Map([
      ['rawg-2', guide('rawg-2', '2026-01-01')],
      ['rawg-3', guide('rawg-3', '2026-05-01')],
      ['rawg-4', guide('rawg-4', '2026-03-01')],
    ]);
    const plan = planImport([guide('rawg-1', '2026-01-01'), guide('rawg-2', '2026-02-01'), guide('rawg-3', '2026-01-01'), guide('rawg-4', '2026-03-01')], current);
    expect(plan.map((p) => p.status)).toEqual(['new', 'newer', 'older', 'same']);
  });
});
