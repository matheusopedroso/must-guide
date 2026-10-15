<script setup>
import { computed, ref, watch } from 'vue';
import { Info, TriangleAlert } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import PsnTitlePicker from '@/components/trophies/PsnTitlePicker.vue';
import TrophyList from '@/components/trophies/TrophyList.vue';
import TrophyHeader from '@/components/trophies/TrophyHeader.vue';
import GuideStats from '@/components/guide-editor/GuideStats.vue';
import GuideCreditsEditor from '@/components/guide-editor/GuideCreditsEditor.vue';
import { useAsyncState } from '@/composables/useAsyncState';
import { useTrophyData } from '@/composables/guide/useTrophyData';
import { useGuideDraft } from '@/composables/guide/useGuideDraft';
import { useTrophyNotes } from '@/composables/guide/useTrophyNotes';
import { useTrophyVersions } from '@/composables/guide/useTrophyVersions';
import { fetchTrophyList } from '@/services/trophies.service';
import { compareVersions } from '@/utils/trophies';
import { dlcGroupsOf, scopeList } from '@/utils/trophyScope';
import { useQueryParam } from '@/composables/useQueryParam';
import { PackagePlus } from 'lucide-vue-next';

defineProps({ game: { type: Object, required: true }, tab: { type: Object, default: null } });

const { draft } = useGuideDraft();
const { getNote, updateNote, backlinks } = useTrophyNotes(draft);
const { versions, principal, active, activeId, add, sync, remove, makePrincipal } = useTrophyVersions(draft);

const adding = ref(false);

// Só os troféus deste guia: jogo base (as DLCs têm guia próprio) ou a DLC
const { list, progress, fullList, loading, error, load } = useTrophyData(active, { scope: draft });

// Lista principal só é buscada quando outra versão está aberta (para comparar)
const otherOpen = computed(() => (active.value && active.value.id !== principal.value?.id ? principal.value : null));
const { data: principalFull } = useAsyncState(otherOpen, load(fetchTrophyList));
const principalList = computed(() => scopeList(principalFull.value, draft.value));

// Guia do jogo com DLCs na lista: aviso levando para a aba DLCs (cada uma vira um guia separado)
const dlcGroups = computed(() => (draft.value?.dlc ? [] : dlcGroupsOf(fullList.value)));
const tabParam = useQueryParam('aba');
function openDlcTab() {
  if (!draft.value.tabs.includes('dlc')) draft.value.tabs.push('dlc');
  tabParam.value = 'dlc';
}

const comparison = computed(() =>
  list.value && principalList.value && otherOpen.value ? compareVersions(principalList.value, list.value) : null,
);

watch(fullList, (l) => {
  if (!l) return;
  sync(l);
  // Guia de DLC: nome e ícone vêm do grupo de troféus da PSN
  const dlc = draft.value?.dlc;
  const group = dlc && l.groups.find((g) => g.id === dlc.groupId);
  if (group && (dlc.name !== group.name || dlc.icon !== group.icon)) Object.assign(dlc, { name: group.name, icon: group.icon });
});

function link(title) {
  add(title);
  adding.value = false;
}
</script>

<template>
  <PsnTitlePicker v-if="!versions.length" :game-title="game.title" @select="link" />

  <div v-else class="d-flex flex-column gap-2">
    <PsnTitlePicker
      v-if="adding"
      title="Adicionar versão (ex.: PS4 ou PS5)"
      :game-title="principal?.name || game.title"
      :exclude="versions.map((v) => v.id)"
      cancelable
      @select="link"
      @cancel="adding = false"
    />

    <template v-else>
      <TrophyHeader
        :versions="versions"
        :active-id="active?.id"
        :list="list"
        :progress="progress"
        :loading="loading"
        @select="activeId = $event"
        @add="adding = true"
        @remove="remove"
        @make-principal="makePrincipal"
      >
        <div class="d-flex align-center flex-wrap gap-1 ml-auto">
          <GuideStats />
          <GuideCreditsEditor />
        </div>
      </TrophyHeader>

      <p v-if="comparison" class="notice d-flex align-start gap-1 text-sm radius-1 px-2 py-1" :class="{ 'is-warn': !comparison.same }">
        <component :is="comparison.same ? Info : TriangleAlert" :size="16" class="shrink-0 notice__icon" />
        <span v-if="comparison.same">Mesma lista da versão principal: as dicas e marcações valem para as duas.</span>
        <span v-else>
          Esta lista tem {{ comparison.different }} troféu(s) diferente(s) da principal. As dicas são ligadas pela posição do
          troféu, então confira os que mudaram.
        </span>
      </p>

      <p v-if="dlcGroups.length && !error" class="notice d-flex align-center flex-wrap gap-1 text-sm radius-1 px-2 py-1">
        <PackagePlus :size="16" class="shrink-0 notice__icon" />
        <span class="flex-1">
          {{ dlcGroups.length }} DLC(s) com troféus ({{ dlcGroups.map((g) => g.name).join(', ') }}). Cada DLC tem um guia separado.
        </span>
        <BaseButton size="sm" variant="ghost" @click="openDlcTab">Ver DLCs</BaseButton>
      </p>

      <EmptyState v-if="error" :icon="TriangleAlert" title="Não deu para carregar os troféus" :text="error">
        <BaseButton size="sm" @click="remove(active.id)">Remover esta versão</BaseButton>
      </EmptyState>

      <TrophyList
        v-else-if="list"
        :list="list"
        :progress="progress"
        :get-note="getNote"
        :backlinks="backlinks"
        @update-note="updateNote"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.notice {
  background: var(--surface-2);
  color: var(--text-muted);

  &__icon {
    margin-top: 2px;
  }

  &.is-warn {
    color: var(--warning);
  }
}
</style>
