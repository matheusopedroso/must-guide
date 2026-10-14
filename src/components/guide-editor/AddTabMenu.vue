<script setup>
import { ref, useTemplateRef } from 'vue';
import { Plus } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useClickOutside } from '@/composables/useClickOutside';

// Botão "+ Aba" com a lista das abas opcionais que ainda não estão no guia
defineProps({ tabs: { type: Array, required: true } });
const emit = defineEmits(['add']);

const open = ref(false);
const root = useTemplateRef('root');
useClickOutside(root, open, () => (open.value = false));

function choose(id) {
  emit('add', id);
  open.value = false;
}
</script>

<template>
  <div ref="root" class="add-tab relative" @keydown.esc="open = false">
    <BaseButton
      :icon="Plus"
      size="sm"
      variant="ghost"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="open = !open"
    >
      Aba
    </BaseButton>

    <div v-if="open" class="add-tab__menu surface radius-2 py-1" role="menu" aria-label="Adicionar aba">
      <p class="text-xs text-subtle fw-600 px-2 pb-1">Adicionar aba</p>
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="menuitem"
        class="add-tab__item d-flex align-start gap-2 w-100 px-2 py-1"
        @click="choose(tab.id)"
      >
        <component :is="tab.icon" :size="18" :stroke-width="1.75" class="add-tab__icon shrink-0" />
        <span class="d-flex flex-column min-w-0">
          <span class="fw-500">{{ tab.label }}</span>
          <span class="text-xs text-muted">{{ tab.description }}</span>
        </span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.add-tab {
  &__menu {
    position: absolute;
    top: calc(100% + #{space(1)});
    right: 0;
    z-index: 30;
    width: min(320px, calc(100vw - #{space(4)}));
    max-height: min(420px, 60dvh);
    overflow-y: auto;
    box-shadow: var(--shadow);
  }

  &__item {
    text-align: left;
    transition: background 0.15s;

    &:hover,
    &:focus-visible {
      background: var(--surface-hover);
      outline: none;
    }
  }

  &__icon {
    margin-top: 2px;
    color: var(--accent);
  }
}
</style>
