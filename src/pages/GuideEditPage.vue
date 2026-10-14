<script setup>
import { watch } from 'vue';
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
import { useQueryParam } from '@/composables/useQueryParam';
import { useGameDetails } from '@/composables/useGameDetails';
import { useGuideTabs } from '@/composables/guide/useGuideTabs';
import { provideGuideDraft } from '@/composables/guide/useGuideDraft';
import { APP_NAME } from '@/config/app';

// Jogo e aba aberta ficam na URL (?jogo=rawg-123&aba=coletaveis).
// O conteúdo do guia (abas, versões, dicas) fica no rascunho, salvo no navegador por jogo.
const gameId = useQueryParam('jogo');
const { game, loading, error, set: setGame } = useGameDetails(gameId);
const { draft, status: saveStatus, syncing, cloud } = provideGuideDraft(game);
const { tabs, available, activeTab, active, add: addTab, remove: removeTab } = useGuideTabs(draft);

function selectGame(selected) {
  setGame(selected); // já temos os dados: evita buscar de novo
  gameId.value = selected.id;
}

const changeGame = () => (gameId.value = '');

watch(game, (g) => {
  document.title = g ? `Guia: ${g.title} · ${APP_NAME}` : `Novo guia · ${APP_NAME}`;
});
</script>

<template>
  <div class="container page">
    <PageHeader title="Novo guia" back="/" :subtitle="gameId ? '' : 'Comece escolhendo o jogo.'">
      <template v-if="gameId" #actions>
        <SaveStatus :status="saveStatus" :syncing="syncing" :cloud="cloud" />
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
        <div class="tabs-bar d-flex align-center gap-1 mb-3">
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

          <component :is="activeTab.component" v-if="activeTab.component" :game="game" />
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

// Abas fixas abaixo do header ao rolar (as abas vão ter conteúdo longo)
.tabs-bar {
  position: sticky;
  top: $header-height;
  z-index: 10;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}
</style>
