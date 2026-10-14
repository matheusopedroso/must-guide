<script setup>
import { Plus } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import DropdownMenu from '@/components/ui/DropdownMenu.vue';

// Botão "+ Aba" com a lista das abas opcionais que ainda não estão no guia
defineProps({ tabs: { type: Array, required: true } });
defineEmits(['add']);
</script>

<template>
  <DropdownMenu label="Adicionar aba" :width="320">
    <template #trigger="{ open, toggle }">
      <BaseButton :icon="Plus" size="sm" variant="ghost" :aria-expanded="open" aria-haspopup="menu" @click="toggle">
        Aba
      </BaseButton>
    </template>

    <template #default="{ close }">
      <p class="menu__title">Adicionar aba</p>
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="menuitem"
        class="menu__item"
        @click="$emit('add', tab.id), close()"
      >
        <component :is="tab.icon" :size="18" :stroke-width="1.75" />
        <span class="d-flex flex-column min-w-0">
          <span class="fw-500">{{ tab.label }}</span>
          <span class="text-xs text-muted">{{ tab.description }}</span>
        </span>
      </button>
    </template>
  </DropdownMenu>
</template>
