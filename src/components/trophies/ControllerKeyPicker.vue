<script setup>
import { onMounted, useTemplateRef } from 'vue';
import ButtonStyleToggle from './ButtonStyleToggle.vue';
import { CONTROLLER_KEYS } from '@/config/controllerKeys';
import { useButtonStyle } from '@/composables/useButtonStyle';

// Escolha do botão de controle para o texto: grade por grupo, desenhada no estilo escolhido (PS / Xbox).
// O texto guarda a posição genérica: quem lê com o outro estilo vê o botão equivalente.
defineEmits(['select', 'cancel']);
const style = useButtonStyle();

// [grupo, botões] na ordem da config
const groups = [...CONTROLLER_KEYS.reduce((map, k) => map.set(k.group, [...(map.get(k.group) ?? []), k]), new Map())];
const root = useTemplateRef('root');
onMounted(() => root.value?.querySelector('button.key')?.focus());
</script>

<template>
  <div ref="root" class="keys surface radius-2 p-2 d-flex flex-column gap-2" @keydown.esc.prevent="$emit('cancel')">
    <div class="d-flex align-center justify-between flex-wrap gap-1">
      <p class="text-sm fw-600">Botão do controle</p>
      <ButtonStyleToggle />
    </div>
    <div v-for="[group, keys] in groups" :key="group" class="d-flex flex-column gap-1">
      <p class="kicker">{{ group }}</p>
      <div class="d-flex flex-wrap gap-1">
        <button
          v-for="k in keys"
          :key="k.id"
          type="button"
          class="key d-flex align-center justify-center radius-1"
          :data-tooltip="k[style]"
          :aria-label="k[style]"
          @click="$emit('select', k)"
        >
          <span class="btn-key" :data-key="k.id">{{ k.ps }}</span>
        </button>
      </div>
    </div>
    <p class="text-xs text-muted">Quem lê vê no estilo que escolher: ✕ vira A no Xbox, L1 vira LB…</p>
  </div>
</template>

<style lang="scss" scoped>
.keys {
  box-shadow: var(--shadow);
}

.key {
  min-width: 40px;
  height: 40px;
  padding-inline: space(1);
  border: 1px solid var(--border);
  background: var(--surface);
  transition: border-color 0.15s, background 0.15s;

  &:hover,
  &:focus-visible {
    border-color: var(--accent);
    background: var(--surface-hover);
  }

  .btn-key {
    cursor: pointer;
  }
}
</style>
