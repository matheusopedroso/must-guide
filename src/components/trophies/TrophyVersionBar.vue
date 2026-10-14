<script setup>
import { computed } from 'vue';
import { Plus, Star, Trash2 } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import TrophyCounts from './TrophyCounts.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';

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
const label = (v) => v.platform || v.id;
</script>

<template>
  <div class="vbar surface radius-2">
    <!-- Lista aberta: ícone, nome, contagem e o seu progresso numa linha -->
    <div class="d-flex align-center gap-2 px-2 py-1">
      <img v-if="list?.icon" :src="list.icon" alt="" class="vbar__icon radius-1 shrink-0" />
      <div v-else class="vbar__icon radius-1 shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="text-xs text-subtle fw-600 truncate">
          Troféus PSN{{ list?.platform ? ` · ${list.platform}` : '' }}{{ isPrincipal && versions.length > 1 ? ' · principal' : '' }}
        </p>
        <h3 v-if="list" class="vbar__name truncate" :title="list.name">{{ list.name }}</h3>
        <p v-else class="text-sm text-muted">{{ loading ? 'Carregando troféus…' : activeId }}</p>
      </div>
      <TrophyCounts v-if="list" :counts="list.counts" class="d-none d-md-flex shrink-0" />
      <div v-if="progress" class="vbar__progress d-flex flex-column gap-1 shrink-0" :title="`Você conquistou ${progress.earned} de ${progress.total}`">
        <span class="text-xs text-muted fw-500">Você: {{ progress.earned }}/{{ progress.total }}</span>
        <ProgressBar :value="progress.earned" :max="progress.total" />
      </div>
    </div>

    <!-- Versões (PS4/PS5…) -->
    <div class="d-flex align-center gap-1 px-2 py-1 border-top">
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

      <BaseButton
        v-if="!isPrincipal"
        :icon="Star"
        icon-only
        size="sm"
        variant="ghost"
        aria-label="Tornar versão principal"
        data-tooltip="Tornar principal"
        @click="$emit('make-principal', activeId)"
      />
      <BaseButton
        :icon="Trash2"
        icon-only
        size="sm"
        variant="danger"
        class="tooltip-left"
        aria-label="Remover versão"
        data-tooltip="Remover versão"
        @click="$emit('remove', activeId)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vbar {
  &__icon {
    width: 40px;
    height: 40px;
    object-fit: cover;
    background: var(--surface-2);
  }

  &__name {
    font-size: 16px;
  }

  &__progress {
    width: 96px;

    @include up(md) {
      width: 160px;
    }
  }
}
</style>
