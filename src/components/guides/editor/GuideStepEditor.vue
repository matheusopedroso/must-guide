<script setup>
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';

defineProps({
  step: { type: Object, required: true },
  index: { type: Number, required: true },
  isLast: Boolean,
});
defineEmits(['move', 'remove', 'insert-after']);
</script>

<template>
  <li class="step-editor d-flex flex-column gap-1 py-2">
    <textarea
      v-model="step.text"
      class="input"
      rows="2"
      :placeholder="`Passo ${index + 1}`"
      :data-step="step.id"
    />
    <div class="d-flex align-center flex-wrap gap-1">
      <input v-model="step.trophy" class="input input--sm flex-1" placeholder="Troféu (opcional)" />
      <label class="checkbox text-sm px-1"><input v-model="step.missable" type="checkbox" /> Perdível</label>
      <div class="d-flex gap-0 ml-auto">
        <BaseButton :icon="ArrowUp" icon-only size="sm" variant="ghost" :disabled="index === 0" aria-label="Subir" @click="$emit('move', -1)" />
        <BaseButton :icon="ArrowDown" icon-only size="sm" variant="ghost" :disabled="isLast" aria-label="Descer" @click="$emit('move', 1)" />
        <BaseButton :icon="Plus" icon-only size="sm" variant="ghost" aria-label="Novo passo abaixo" @click="$emit('insert-after')" />
        <BaseButton :icon="Trash2" icon-only size="sm" variant="danger" aria-label="Remover passo" @click="$emit('remove')" />
      </div>
    </div>
  </li>
</template>

<style lang="scss" scoped>
.step-editor + .step-editor {
  border-top: 1px solid var(--border);
}

.input--sm {
  min-height: 32px;
  min-width: 160px;
  font-size: 13px;
}
</style>
