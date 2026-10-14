<script setup>
import { computed } from 'vue';
import { Plus, Star, Trash2 } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import TrophyCounts from './TrophyCounts.vue';

// Cabeçalho da aba Troféus: versão aberta (PS4/PS5…), progresso da conta e troca de versão
const props = defineProps({
  versions: { type: Array, required: true },
  activeId: { type: String, default: null },
  list: { type: Object, default: null },
  progress: { type: Object, default: null },
  loading: Boolean,
});
defineEmits(['select', 'add', 'remove', 'make-principal']);

const isPrincipal = computed(() => props.versions[0]?.id === props.activeId);
const percent = computed(() => (props.progress ? Math.round((props.progress.earned / props.progress.total) * 100) : 0));
const label = (v) => v.platform || v.id;
</script>

<template>
  <div class="surface radius-2 d-flex flex-column">
    <div class="d-flex align-center gap-2 p-2">
      <img v-if="list?.icon" :src="list.icon" alt="" class="list-icon radius-1 shrink-0" />
      <div v-else class="list-icon radius-1 shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="text-xs text-subtle fw-600">
          Troféus PSN{{ list?.platform ? ` · ${list.platform}` : '' }}{{ isPrincipal && versions.length > 1 ? ' · principal' : '' }}
        </p>
        <h3 v-if="list" class="line-clamp-2">{{ list.name }}</h3>
        <p v-else class="text-sm text-muted">{{ loading ? 'Carregando troféus…' : activeId }}</p>
        <TrophyCounts v-if="list" :counts="list.counts" class="mt-1" />
      </div>
    </div>

    <div v-if="progress" class="d-flex align-center gap-2 px-2 pb-2">
      <div class="bar flex-1" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
        <div class="bar__fill" :class="{ 'is-full': percent === 100 }" :style="{ width: `${percent}%` }" />
      </div>
      <span class="text-xs text-muted fw-500 shrink-0">Você: {{ progress.earned }}/{{ progress.total }}</span>
    </div>

    <div class="d-flex align-center flex-wrap gap-1 p-2 border-top">
      <div class="d-flex flex-wrap gap-1 flex-1" role="group" aria-label="Versões do jogo">
        <button
          v-for="(v, i) in versions"
          :key="v.id"
          type="button"
          class="chip chip--sm"
          :class="{ 'is-active': v.id === activeId }"
          :aria-pressed="v.id === activeId"
          :title="v.name"
          @click="$emit('select', v.id)"
        >
          <Star v-if="i === 0 && versions.length > 1" :size="12" :stroke-width="2" /> {{ label(v) }}
        </button>
        <button type="button" class="chip chip--sm" @click="$emit('add')"><Plus :size="14" /> Versão</button>
      </div>

      <div class="d-flex gap-1">
        <BaseButton v-if="!isPrincipal" :icon="Star" size="sm" variant="ghost" @click="$emit('make-principal', activeId)">
          Principal
        </BaseButton>
        <BaseButton :icon="Trash2" icon-only size="sm" variant="danger" aria-label="Remover versão" @click="$emit('remove', activeId)" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.list-icon {
  width: 56px;
  height: 56px;
  object-fit: cover;
  background: var(--surface-2);
}

.bar {
  height: 8px;
  border-radius: $r-full;
  background: var(--surface-2);
  overflow: hidden;

  &__fill {
    height: 100%;
    border-radius: inherit;
    background: var(--accent);
    transition: width 0.3s $ease;

    &.is-full {
      background: var(--success);
    }
  }
}
</style>
