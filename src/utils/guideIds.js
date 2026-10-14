// Identificador do guia. Jogo base: o id do jogo ("rawg-123"). DLC: jogo + grupo de troféus da PSN
// ("rawg-123~001") — cada DLC é um guia separado, ligado ao do jogo (parentId).
export const DLC_SEP = '~';

export const dlcGuideId = (gameId, groupId) => `${gameId}${DLC_SEP}${groupId}`;

export function parseGuideId(id = '') {
  const [gameId, groupId] = String(id).split(DLC_SEP);
  return { gameId, groupId: groupId ?? null };
}

// Guias antigos não têm guideId (eram só por jogo)
export const guideIdOf = (g) => g?.guideId ?? g?.gameId ?? '';
