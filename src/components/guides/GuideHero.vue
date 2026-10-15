<script setup>
import { computed } from 'vue';
import { CornerLeftUp, Globe, HardDrive } from 'lucide-vue-next';
import DetailHero from '@/components/ui/DetailHero.vue';
import GuideStatsSummary from '@/components/guide-editor/GuideStatsSummary.vue';
import { formatDate } from '@/utils/date';

// Topo da leitura do guia (DetailHero): selos de status, título, meta e visão geral (linha das "notas").
// Guia de DLC: título e ícone da DLC, selo "Guia de DLC" e link para o guia do jogo.
// O título do jogo leva para a página do jogo.
const props = defineProps({
  guide: { type: Object, required: true },
  game: { type: Object, default: null }, // detalhes do jogo (ano, plataformas), se já carregou
  source: { type: String, default: '' }, // cloud | local
});

const gameTitle = computed(() => props.game?.title ?? props.guide.game?.title ?? '');
const dlc = computed(() => props.guide.dlc ?? null);
const title = computed(() => (dlc.value ? dlc.value.name || 'DLC' : gameTitle.value));
const cover = computed(() => props.game?.cover ?? props.guide.game?.cover ?? null);
const platforms = computed(() => [...new Set(props.guide.versions.map((v) => v.platform).filter(Boolean))]);
const meta = computed(() => [
  props.game?.year,
  platforms.value.join(' · '),
  props.guide.updatedAt && `Atualizado em ${formatDate(props.guide.updatedAt)}`,
]);
const published = computed(() => props.guide.status === 'published');
const hasStats = computed(() => Object.values(props.guide.stats ?? {}).some(Boolean));
</script>

<template>
  <DetailHero :title="title" :kicker="dlc ? 'Guia de DLC' : 'Guia de troféus'" :cover="cover" :icon="dlc?.icon" :meta="meta">
    <template #labels>
      <span v-if="published" class="badge badge--success"><Globe :size="12" /> Publicado</span>
      <span v-else class="badge">Rascunho</span>
      <span v-if="source === 'local'" class="badge"><HardDrive :size="12" /> Neste navegador</span>
    </template>
    <template #subtitle>
      <RouterLink v-if="dlc" :to="{ name: 'guide-view', params: { id: guide.gameId } }" class="parent d-inline-flex align-center gap-1 text-sm fw-600">
        <CornerLeftUp :size="14" /> DLC de {{ gameTitle }}
      </RouterLink>
      <RouterLink v-else :to="{ name: 'game', params: { id: guide.gameId } }" class="parent d-inline-flex align-center gap-1 text-sm fw-600">
        Ver página do jogo
      </RouterLink>
    </template>
    <template v-if="hasStats" #details>
      <GuideStatsSummary :stats="guide.stats" show-label />
    </template>
    <template v-if="$slots.actions" #actions><slot name="actions" /></template>
    <template v-if="$slots.extra" #extra><slot name="extra" /></template>
  </DetailHero>
</template>

<style lang="scss" scoped>
.parent {
  margin-bottom: space(1);
  color: var(--accent);

  &:hover {
    text-decoration: underline;
  }
}
</style>
