<script setup>
import { computed } from 'vue';
import { BookmarkPlus, Check, X } from 'lucide-vue-next';
import ActionIcon from '@/components/ui/ActionIcon.vue';
import DropdownMenu from '@/components/ui/DropdownMenu.vue';
import { useLibrary } from '@/composables/useLibrary';
import { LIBRARY_STATUSES, LIBRARY_STATUS_MAP } from '@/config/library';

// Ação "Biblioteca" (página do jogo e leitura do guia): menu com Jogando / Quero platinar / Platinado e
// "Tirar da biblioteca". O ícone e o rótulo mostram o status atual (ligado = cor de destaque).
const props = defineProps({
  game: { type: Object, required: true }, // { id, title, cover, … }
});
const { statusOf, setStatus } = useLibrary();
const current = computed(() => LIBRARY_STATUS_MAP[statusOf(props.game.id)] ?? null);
</script>

<template>
  <DropdownMenu label="Biblioteca" :width="220" start>
    <template #trigger="{ open, toggle }">
      <ActionIcon
        :icon="current?.icon ?? BookmarkPlus"
        :label="current?.label ?? 'Biblioteca'"
        :active="!!current"
        aria-haspopup="menu"
        :aria-expanded="open"
        @click="toggle"
      />
    </template>
    <template #default="{ close }">
      <button
        v-for="s in LIBRARY_STATUSES"
        :key="s.id"
        type="button"
        role="menuitemradio"
        class="menu__item d-flex align-center gap-2"
        :aria-checked="current?.id === s.id"
        @click="setStatus(game, s.id), close()"
      >
        <component :is="s.icon" :size="16" />
        <span class="flex-1">{{ s.label }}</span>
        <Check v-if="current?.id === s.id" :size="16" class="text-accent" />
      </button>
      <button v-if="current" type="button" role="menuitem" class="menu__item d-flex align-center gap-2 text-muted" @click="setStatus(game, null), close()">
        <X :size="16" /> Tirar da biblioteca
      </button>
    </template>
  </DropdownMenu>
</template>
