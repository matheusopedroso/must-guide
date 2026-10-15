import { describe, expect, it } from 'vitest';
import { EDITOR_TOOLSETS, resolveTools } from '@/config/editor';

describe('botões do editor', () => {
  it('conjunto por nome, lista própria ou tudo', () => {
    expect(resolveTools()).toBeNull();
    expect(resolveTools('full')).toBeNull();
    expect([...resolveTools('collectible')]).toEqual(EDITOR_TOOLSETS.collectible);
    expect([...resolveTools(['bold', 'spoiler'])]).toEqual(['bold', 'spoiler']);
    expect(() => resolveTools('nada')).toThrow(/desconhecido/);
  });
});
