<script setup>
import { computed, useTemplateRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Trash2, TriangleAlert } from 'lucide-vue-next';
import PageHeader from '@/components/ui/PageHeader.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseTabs from '@/components/ui/BaseTabs.vue';
import GamePicker from '@/components/games/GamePicker.vue';
import SelectedGameCard from '@/components/guide-editor/SelectedGameCard.vue';
import AddTabMenu from '@/components/guide-editor/AddTabMenu.vue';
import TabPlaceholder from '@/components/guide-editor/TabPlaceholder.vue';
import SaveStatus from '@/components/guide-editor/SaveStatus.vue';
import PublishControl from '@/components/guide-editor/PublishControl.vue';
import { useGameDetails } from '@/composables/useGameDetails';
import { useGuideTabs } from '@/composables/guide/useGuideTabs';
import { provideGuideDraft } from '@/composables/guide/useGuideDraft';
import { useIsStuck } from '@/composables/useIsStuck';
import { provideCollectibleContext } from '@/composables/guide/useCollectibles';
import { collectiblesOf } from '@/utils/collectibles';
import { APP_NAME } from '@/config/app';

// /guia/novo → escolher o jogo · /guia/:id/editar → editor (aba aberta em ?aba=).
// O conteúdo do guia (abas, versões, dicas) fica no rascunho: navegador + nuvem (useGuideDraft).
const route = useRoute();
const router = useRouter();
const gameId = computed(() => String(route.params.id ?? ''));
const { game, loading, error, set: setGame } = useGameDetails(gameId);
const { draft, status: saveStatus, syncing, cloud } = provideGuideDraft(game);
const { tabs, available, activeTab, active, add: addTab, remove: removeTab } = useGuideTabs(draft);

// Coletáveis do guia para citar em qualquer aba de texto (botão da joia no editor)
const collectibleItems = computed(() => collectiblesOf(draft.value));
provideCollectibleContext({ items: collectibleItems, byId: computed(() => new Map(collectibleItems.value.map((c) => [c.id, c]))) });

function selectGame(selected) {
  setGame(selected); // já temos os dados: evita buscar de novo
  router.replace({ name: 'guide-edit', params: { id: selected.id } });
}

const changeGame = () => router.push({ name: 'guide-new' });

// Abas grudadas embaixo da barra → tapam o vão acima delas (ver .tabs-bar.is-stuck)
const stuck = useIsStuck(useTemplateRef('tabsSentinel'));

watch(game, (g) => {
  document.title = g ? `Editar: ${g.title} · ${APP_NAME}` : `Novo guia · ${APP_NAME}`;
});
</script>

<template>
  <div class="container page">
    <PageHeader
      :title="gameId ? 'Editar guia' : 'Novo guia'"
      :back="gameId ? { name: 'my-guides' } : '/'"
      :subtitle="gameId ? '' : 'Comece escolhendo o jogo.'"
    >
      <template v-if="gameId && draft" #actions>
        <div class="d-flex flex-column align-end gap-1">
          <PublishControl />
          <SaveStatus :status="saveStatus" :syncing="syncing" :cloud="cloud" />
        </div>
      </template>
    </PageHeader>

    <section v-if="!gameId" class="picker-wrap">
      <GamePicker autofocus @select="selectGame" />
    </section>

    <EmptyState v-else-if="error" :icon="TriangleAlert" title="Não deu para carregar o jogo" :text="error">
      <BaseButton @click="changeGame">Escolher outro jogo</BaseButton>
    </EmptyState>

    <template v-else>
      <SelectedGameCard :game="game" :loading="loading" class="mb-2" @change="changeGame" />

      <template v-if="game">
        <div ref="tabsSentinel" aria-hidden="true" />
        <div class="tabs-bar d-flex align-center gap-1 mb-3" :class="{ 'is-stuck': stuck }">
          <BaseTabs v-model="active" :tabs="tabs" label="Seções do guia" id-prefix="guide-tab" class="flex-1" />
          <AddTabMenu v-if="available.length" :tabs="available" class="shrink-0" @add="addTab" />
        </div>

        <section
          :id="`guide-tab-panel-${activeTab.id}`"
          role="tabpanel"
          :aria-labelledby="`guide-tab-${activeTab.id}`"
        >
          <div v-if="!activeTab.fixed" class="d-flex justify-end mb-1">
            <BaseButton :icon="Trash2" size="sm" variant="danger" @click="removeTab(activeTab.id)">
              Remover aba
            </BaseButton>
          </div>

          <component :is="activeTab.component" v-if="activeTab.component" :key="activeTab.id" :tab="activeTab" :game="game" />
          <TabPlaceholder v-else :tab="activeTab" />
        </section>
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.picker-wrap {
  max-width: 640px;
}

// Abas fixas abaixo da barra de navegação ao rolar; sobem quando a barra some (--nav-offset)
.tabs-bar {
  position: sticky;
  top: var(--nav-offset);
  transition: top 0.22s $ease;
  z-index: 10;
  // 8px a mais dos lados: cobre o anel dos cards conquistados que passam por baixo
  margin-inline: calc(-1 * #{space(1)});
  padding-inline: space(1);
  background: var(--bg);
  border-bottom: 1px solid var(--border);

  // Grudada: preenche o vão entre a barra de navegação e as abas (senão o conteúdo aparece ali ao rolar)
  &.is-stuck::before {
    content: '';
    position: absolute;
    inset-inline: 0;
    bottom: 100%;
    height: var(--nav-offset);
    background: var(--bg);
    pointer-events: none;
  }
}
</style>
