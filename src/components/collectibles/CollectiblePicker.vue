<script setup>
import { Gem } from 'lucide-vue-next';
import SearchPicker from '@/components/ui/SearchPicker.vue';

// Lista para citar um coletável no texto (mostra a região de cada um)
defineProps({
  items: { type: Array, required: true }, // collectiblesOf(guide)
  initialTerm: { type: String, default: '' },
});
defineEmits(['select', 'cancel']);

const names = (c) => [c.name, c.type, c.location];
</script>

<template>
  <SearchPicker
    :items="items"
    :names="names"
    :initial-term="initialTerm"
    placeholder="Buscar coletável"
    label="Citar coletável"
    empty="Nenhum coletável encontrado. Cadastre na aba Coletáveis."
    @select="$emit('select', $event)"
    @cancel="$emit('cancel')"
  >
    <template #item="{ item: c }">
      <Gem :size="16" class="shrink-0 text-accent" />
      <span class="d-flex flex-column min-w-0 flex-1">
        <span class="text-sm fw-500 truncate">{{ c.name || 'Coletável' }}</span>
        <span v-if="c.region || c.type" class="text-xs text-muted truncate">{{ [c.region, c.type].filter(Boolean).join(' · ') }}</span>
      </span>
    </template>
  </SearchPicker>
</template>
