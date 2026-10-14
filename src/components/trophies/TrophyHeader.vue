<script setup>
import { computed } from 'vue';
import { EllipsisVertical, Plus, Star, Trash2 } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import DropdownMenu from '@/components/ui/DropdownMenu.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import TrophyCounts from './TrophyCounts.vue';

// Cabeçalho único da aba Troféus:
// linha 1 = lista aberta (nome, contagem, seu progresso) + menu de versões;
// linha 2 = troca de versão (só com 2+) e o slot (visão geral do guia).
const props = defineProps({
  versions: { type: Array, required: true },
  activeId: { type: String, default: null },
  list: { type: Object, default: null },
  progress: { type: Object, default: null },
  loading: Boolean,
});
defineEmits(['select', 'add', 'remove', 'make-principal']);

const isPrincipal = computed(() => props.versions[0]?.id === props.activeId);
const multiple = computed(() => props.versions.length > 1);
const label = (v) => v.platform || v.id;
</script>

<template>
  <header class="theader surface radius-2">
    <div class="d-flex align-center gap-2 px-2 py-1">
      <img v-if="list?.icon" :src="list.icon" alt="" class="theader__icon radius-1 shrink-0" />
      <div v-else class="theader__icon radius-1 shrink-0" />

      <div class="flex-1 min-w-0">
        <h3 v-if="list" class="theader__name truncate" :title="list.name">{{ list.name }}</h3>
        <p v-else class="text-sm text-muted">{{ loading ? 'Carregando troféus…' : activeId }}</p>
        <div v-if="list" class="d-flex align-center gap-2 text-xs text-muted">
          <span class="fw-500">{{ list.platform ? `${list.platform} · ` : '' }}{{ list.trophies.length }} troféus</span>
          <TrophyCounts :counts="list.counts" class="d-none d-md-flex" />
        </div>
      </div>

      <div
        v-if="progress"
        class="theader__progress d-flex flex-column gap-1 shrink-0"
        :title="`Você conquistou ${progress.earned} de ${progress.total}`"
      >
        <span class="text-xs text-muted fw-500">Você: {{ progress.earned }}/{{ progress.total }}</span>
        <ProgressBar :value="progress.earned" :max="progress.total" />
      </div>

      <DropdownMenu label="Versões do jogo" class="shrink-0">
        <template #trigger="{ open, toggle }">
          <BaseButton
            :icon="EllipsisVertical"
            icon-only
            size="sm"
            variant="ghost"
            class="tooltip-left"
            aria-label="Opções da lista"
            data-tooltip="Versões"
            aria-haspopup="menu"
            :aria-expanded="open"
            @click="toggle"
          />
        </template>
        <template #default="{ close }">
          <button type="button" role="menuitem" class="menu__item" @click="$emit('add'), close()">
            <Plus :size="16" /> Adicionar versão
          </button>
          <button
            v-if="!isPrincipal"
            type="button"
            role="menuitem"
            class="menu__item"
            @click="$emit('make-principal', activeId), close()"
          >
            <Star :size="16" /> Tornar esta a principal
          </button>
          <button type="button" role="menuitem" class="menu__item menu__item--danger" @click="$emit('remove', activeId), close()">
            <Trash2 :size="16" /> Remover esta versão
          </button>
        </template>
      </DropdownMenu>
    </div>

    <div class="d-flex align-center justify-between flex-wrap gap-1 px-2 py-1 border-top">
      <div v-if="multiple" class="d-flex flex-wrap gap-1" role="group" aria-label="Versão aberta">
        <button
          v-for="(v, i) in versions"
          :key="v.id"
          type="button"
          class="chip chip--sm"
          :class="{ 'is-active': v.id === activeId }"
          :aria-pressed="v.id === activeId"
          :title="i === 0 ? `${v.name} (principal)` : v.name"
          @click="$emit('select', v.id)"
        >
          <Star v-if="i === 0" :size="12" :stroke-width="2" /> {{ label(v) }}
        </button>
      </div>
      <slot />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.theader {
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
    width: 88px;

    @include up(md) {
      width: 160px;
    }
  }
}
</style>
