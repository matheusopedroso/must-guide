<script setup>
import { TROPHY_FLAGS } from '@/config/trophies';

// Marcações do guia num troféu (História, Perdível, Online… — vêm de config/trophies)
const props = defineProps({ note: { type: Object, required: true } });
const emit = defineEmits(['update']);

const toggle = (field) => emit('update', { [field]: !props.note[field] });
</script>

<template>
  <div class="d-flex flex-wrap gap-1">
    <!-- mousedown.prevent: marcar não fecha o texto em edição (senão o layout pula e o toque se perde) -->
    <button
      v-for="flag in TROPHY_FLAGS"
      :key="flag.id"
      type="button"
      class="chip chip--sm"
      :class="{ 'is-on': note[flag.id] }"
      :aria-pressed="!!note[flag.id]"
      @mousedown.prevent
      @click="toggle(flag.id)"
    >
      <component :is="flag.icon" :size="14" :stroke-width="1.75" /> {{ flag.label }}
    </button>
  </div>
</template>
