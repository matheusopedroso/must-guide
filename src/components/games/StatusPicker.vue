<script setup>
import { GAME_STATUS } from '@/config/status';

const model = defineModel({ type: String, required: true });
defineProps({ disabled: Boolean });
</script>

<template>
  <div class="scroll-x gap-1" role="radiogroup" aria-label="Status">
    <button
      v-for="s in GAME_STATUS"
      :key="s.id"
      type="button"
      role="radio"
      :aria-checked="model === s.id"
      :disabled="disabled"
      class="chip"
      :class="{ 'is-active': model === s.id }"
      @click="model = s.id"
    >
      {{ s.label }}
    </button>
  </div>
</template>
