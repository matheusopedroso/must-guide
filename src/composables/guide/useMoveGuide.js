import { computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { deleteDraft, listDrafts, loadDraft, moveCollected, saveDraft } from '@/services/draft.service';
import { editedAt, gameSnapshot, isBlankDraft } from '@/utils/guideDraft';
import { dlcGuideId, guideIdOf, parseGuideId } from '@/utils/guideIds';

// Trocar o jogo de um guia (ex.: era a versão comum e o certo é o Director's Cut): o id do guia é o do jogo,
// então o guia muda de id — dicas, abas, versões da PSN e status vão junto, e os guias das DLCs também
// ("jogo~grupo" → "novo~grupo"). Nuvem numa escrita só (grava os novos + apaga os antigos); depois o navegador.
export function useMoveGuide() {
  const { enabled, isAdmin, user } = useAuth();
  const blocked = computed(() => (enabled && !isAdmin.value ? 'Entre como administrador para trocar o jogo' : ''));

  // Guias das DLCs do jogo: do navegador e da nuvem, a cópia mais recente de cada
  async function dlcGuidesOf(gameId) {
    const byId = new Map(listDrafts().filter((d) => d.parentId === gameId).map((d) => [guideIdOf(d), d]));
    if (enabled) {
      const { listDlcGuides } = await import('@/services/guides.service');
      for (const g of await listDlcGuides(gameId, { admin: true })) {
        const local = byId.get(guideIdOf(g));
        if (!local || editedAt(g) >= editedAt(local)) byId.set(guideIdOf(g), g);
      }
    }
    return [...byId.values()];
  }

  // Já existe guia (com conteúdo) no jogo de destino? Não sobrescreve
  async function targetTaken(gameId) {
    const local = loadDraft(gameId);
    if (local && !isBlankDraft(local)) return true;
    if (!enabled) return false;
    const { fetchGuide } = await import('@/services/guides.service');
    return !!(await fetchGuide(gameId));
  }

  // guide: o guia do jogo (cópia atual do editor) · game: o jogo novo. → id novo do guia
  async function move(guide, game) {
    if (blocked.value) throw new Error(blocked.value);
    const oldId = guideIdOf(guide);
    if (game.id === oldId) return oldId;
    if (await targetTaken(game.id)) throw new Error(`Já existe um guia de ${game.title}. Apague ele antes ou escolha outro jogo.`);

    const now = new Date().toISOString();
    const snapshot = gameSnapshot(game); // jogo novo: nada do anterior
    const moveOne = (g) => {
      const { groupId } = parseGuideId(guideIdOf(g));
      const guideId = groupId ? dlcGuideId(game.id, groupId) : game.id;
      return { ...g, guideId, gameId: game.id, parentId: groupId ? game.id : null, game: snapshot, updatedAt: now };
    };
    const olds = [guide, ...(await dlcGuidesOf(oldId))];
    const moved = olds.map(moveOne);
    const oldIds = olds.map(guideIdOf);

    if (enabled) {
      const { moveGuides } = await import('@/services/guides.service');
      await moveGuides(moved, oldIds, user.value.uid); // falhou → nada muda no navegador
    }
    moved.forEach((g, i) => {
      saveDraft(g);
      moveCollected(oldIds[i], guideIdOf(g));
      deleteDraft(oldIds[i]);
    });
    return game.id;
  }

  return { blocked, move };
}
