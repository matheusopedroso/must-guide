<script setup>
import { ref } from 'vue';
import { ArrowLeftRight, TriangleAlert } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import PsnTitlePicker from '@/components/trophies/PsnTitlePicker.vue';
import TrophyList from '@/components/trophies/TrophyList.vue';
import TrophyCounts from '@/components/trophies/TrophyCounts.vue';
import { useQueryParam } from '@/composables/useQueryParam';
import { useAsyncState } from '@/composables/useAsyncState';
import { fetchTrophyList } from '@/services/trophies.service';

defineProps({ game: { type: Object, required: true } });

// Código da lista na PSN fica na URL (?psn=NPWR…) até o guia ser salvo
const psnId = useQueryParam('psn');
const serviceHint = ref(null); // já sabido quando vem da lista da conta → evita tentativa extra

const { data: list, loading, error } = useAsyncState(psnId, (id, opts) => fetchTrophyList(id, serviceHint.value, opts));

function link(title) {
  serviceHint.value = title.service;
  psnId.value = title.id;
}

const unlink = () => (psnId.value = '');
</script>

<template>
  <PsnTitlePicker v-if="!psnId" :game-title="game.title" @select="link" />

  <div v-else class="d-flex flex-column gap-2">
    <div class="surface radius-2 d-flex flex-column gap-2 p-2">
      <div class="d-flex align-center gap-2">
        <img v-if="list?.icon" :src="list.icon" alt="" class="list-icon radius-1 shrink-0" />
        <div v-else class="list-icon radius-1 shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-xs text-subtle fw-600">Troféus PSN{{ list?.platform ? ` · ${list.platform}` : '' }}</p>
          <h3 v-if="list" class="line-clamp-2">{{ list.name }}</h3>
          <p v-else class="text-sm text-muted">{{ loading ? 'Carregando troféus…' : psnId }}</p>
        </div>
        <BaseButton :icon="ArrowLeftRight" size="sm" variant="ghost" class="shrink-0" @click="unlink">Trocar</BaseButton>
      </div>
      <TrophyCounts v-if="list" :counts="list.counts" />
    </div>

    <EmptyState v-if="error" :icon="TriangleAlert" title="Não deu para carregar os troféus" :text="error">
      <BaseButton size="sm" @click="unlink">Escolher outro jogo</BaseButton>
    </EmptyState>

    <TrophyList v-else-if="list" :list="list" />
  </div>
</template>

<style lang="scss" scoped>
.list-icon {
  width: 56px;
  height: 56px;
  object-fit: cover;
  background: var(--surface-2);
}
</style>
