import { computed, ref } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useGameDetails } from '@/composables/useGameDetails';
import { useGuide } from './useGuide';
import { useTrophyData } from './useTrophyData';
import { useTrophyNotes } from './useTrophyNotes';
import { useTrophyVersions } from './useTrophyVersions';
import { provideCollectibleContext, useCollected } from './useCollectibles';
import { collectiblesOf } from '@/utils/collectibles';
import { parseGuideId } from '@/utils/guideIds';

// Tudo o que a leitura de um guia precisa, para a página do guia e a do troféu: o guia (nuvem/navegador),
// o jogo (cópia guardada no guia), as anotações dos troféus, as versões, a lista da PSN (jogo base ou DLC)
// com o seu progresso e os coletáveis (provê o contexto: marcar vale para o guia todo).
// guideId: ref com o id do guia ("rawg-123" ou "rawg-123~001")
export function useGuideReader(guideId) {
  const gameId = computed(() => parseGuideId(guideId.value).gameId ?? '');
  const { guide, source, loading, error } = useGuide(guideId);
  const { game } = useGameDetails(computed(() => (guide.value ? gameId.value : '')), { saved: () => guide.value?.game });
  const { enabled, isAdmin } = useAuth();

  const { getNote, backlinks } = useTrophyNotes(guide);
  const { versions, active, activeId } = useTrophyVersions(guide);
  const withProgress = computed(() => !enabled || isAdmin.value); // progresso da conta: só o admin
  const { list, progress, loading: listLoading, error: listError } = useTrophyData(active, { withProgress, scope: guide });

  const { collected, toggle: toggleCollected } = useCollected(guideId);
  const collectibleItems = computed(() => collectiblesOf(guide.value));
  const openCollectible = ref(null); // coletável aberto no modal de detalhes
  provideCollectibleContext({
    items: collectibleItems,
    byId: computed(() => new Map(collectibleItems.value.map((c) => [c.id, c]))),
    collected,
    toggle: toggleCollected,
    open: (id) => (openCollectible.value = id),
  });

  const canEdit = computed(() => !enabled || isAdmin.value || source.value === 'local');
  const isDlc = computed(() => !!guide.value?.dlc);
  const title = computed(() => (guide.value?.dlc ? guide.value.dlc.name || 'DLC' : (guide.value?.game?.title ?? 'Guia')));

  return {
    gameId, guide, source, loading, error, game, enabled, isAdmin, canEdit, isDlc, title,
    getNote, backlinks, versions, active, activeId, list, progress, listLoading, listError, openCollectible,
  };
}
