<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Eye, PackagePlus, Pencil, Plus } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import TrophyCounts from '@/components/trophies/TrophyCounts.vue';
import { useGuideDraft } from '@/composables/guide/useGuideDraft';
import { useTrophyData } from '@/composables/guide/useTrophyData';
import { useTrophyVersions } from '@/composables/guide/useTrophyVersions';
import { useDlcGuides } from '@/composables/guide/useDlcGuides';
import { saveDraft } from '@/services/draft.service';
import { createDraft, GUIDE_STATUS } from '@/utils/guideDraft';
import { dlcGroupsOf } from '@/utils/trophyScope';

// Aba DLCs no editor do jogo: cada DLC com troféus na lista da PSN vira um guia separado
// (com Troféus, Guia, Roadmap… próprios), como no PSNProfiles. Aqui cria, abre e acompanha cada um.
const props = defineProps({
  game: { type: Object, required: true },
  tab: { type: Object, default: null },
});

const router = useRouter();
const { draft } = useGuideDraft();
const { principal } = useTrophyVersions(draft);
const { fullList, loading } = useTrophyData(principal, { withProgress: false });
const groups = computed(() => dlcGroupsOf(fullList.value));
const { items } = useDlcGuides(computed(() => draft.value?.gameId ?? ''));
const guideOf = (groupId) => items.value.find((g) => g.dlcGroup === groupId) ?? null;

// Cópia simples (o rascunho é reativo: structuredClone não aceita o proxy)
const copy = (value) => JSON.parse(JSON.stringify(value));

// Novo guia da DLC: herda as versões (listas da PSN) e as anotações que os troféus dela já tinham aqui
function createGuide(group) {
  const dlcDraft = createDraft(props.game, { dlc: { groupId: group.id, name: group.name, icon: group.icon } });
  dlcDraft.versions = copy(draft.value.versions);
  const ids = new Set(fullList.value.trophies.filter((t) => t.groupId === group.id).map((t) => String(t.id)));
  dlcDraft.trophies = Object.fromEntries(Object.entries(draft.value.trophies).filter(([id]) => ids.has(id)).map(([id, n]) => [id, copy(n)]));
  dlcDraft.updatedAt = new Date().toISOString(); // mais nova que a nuvem (vazia): sobe ao abrir
  saveDraft(dlcDraft);
  router.push({ name: 'guide-edit', params: { id: dlcDraft.guideId } });
}
</script>

<template>
  <div class="d-flex flex-column gap-2">
    <p v-if="!principal" class="notice text-sm radius-1 p-2">Vincule a lista de troféus na aba Troféus para ver as DLCs do jogo.</p>

    <p v-else-if="loading" class="text-sm text-muted">Carregando as DLCs da lista…</p>

    <EmptyState v-else-if="!groups.length" :icon="PackagePlus" title="Sem DLCs com troféus" text="A lista da PSN deste jogo não tem troféus de DLC." />

    <template v-else>
      <p class="text-sm text-muted">
        Cada DLC tem um guia separado, com troféus, guia, roadmap e dificuldade próprios. Ele aparece no guia do jogo e em Meus guias.
      </p>
      <article v-for="g in groups" :key="g.id" class="dlc surface radius-2 d-flex align-center flex-wrap gap-2 p-2">
        <img v-if="g.icon" :src="g.icon" alt="" class="dlc__icon radius-1 shrink-0" loading="lazy" />
        <div v-else class="dlc__icon radius-1 shrink-0" />
        <div class="flex-1 min-w-0 d-flex flex-column gap-1">
          <div class="d-flex align-center flex-wrap gap-1">
            <h4 class="dlc__name truncate">{{ g.name }}</h4>
            <span v-if="guideOf(g.id)" class="badge" :class="`badge--${GUIDE_STATUS[guideOf(g.id).status].tone}`">
              {{ GUIDE_STATUS[guideOf(g.id).status].label }}
            </span>
          </div>
          <TrophyCounts :counts="g.counts" />
        </div>
        <div class="d-flex gap-1">
          <template v-if="guideOf(g.id)">
            <BaseButton :to="{ name: 'guide-view', params: { id: guideOf(g.id).guideId } }" :icon="Eye" size="sm" variant="ghost">Ver</BaseButton>
            <BaseButton :to="{ name: 'guide-edit', params: { id: guideOf(g.id).guideId } }" :icon="Pencil" size="sm">Editar guia</BaseButton>
          </template>
          <BaseButton v-else :icon="Plus" size="sm" variant="primary" @click="createGuide(g)">Criar guia da DLC</BaseButton>
        </div>
      </article>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.notice {
  background: var(--surface-2);
  color: var(--text-muted);
}

.dlc {
  &__icon {
    width: 56px;
    height: 56px;
    object-fit: cover;
    background: var(--surface-2);
  }

  &__name {
    font-size: 16px;
  }
}
</style>
