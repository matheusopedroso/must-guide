<script setup>
import { onMounted, useTemplateRef } from 'vue';
import { CALLOUTS } from '@/config/callouts';

// Tipos de caixa de aviso para o parágrafo do cursor. Escolher o tipo que a caixa já tem tira a caixa.
defineEmits(['select', 'cancel']);
const root = useTemplateRef('root');
onMounted(() => root.value?.querySelector('button')?.focus());
</script>

<template>
  <div ref="root" class="callouts surface radius-2 py-1" role="menu" aria-label="Caixa de aviso" @keydown.esc.prevent="$emit('cancel')">
    <p class="text-xs text-muted px-2 pb-1">O parágrafo do cursor vira uma caixa (o mesmo tipo de novo tira).</p>
    <button v-for="c in CALLOUTS" :key="c.id" type="button" role="menuitem" class="menu__item" :data-kind="c.id" @click="$emit('select', c.id)">
      <component :is="c.icon" :size="16" class="callouts__icon" /> {{ c.label }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.callouts {
  box-shadow: var(--shadow);

  @include up(md) {
    width: 280px !important;
  }
}

.menu__item[data-kind='warning'] .callouts__icon { color: var(--warning); }
.menu__item[data-kind='missable'] .callouts__icon { color: var(--danger); }
.menu__item[data-kind='tip'] .callouts__icon { color: var(--success); }
.menu__item[data-kind='note'] .callouts__icon { color: var(--info); }
</style>
