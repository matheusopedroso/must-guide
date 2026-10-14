<script setup>
import { nextTick, useTemplateRef, watch } from 'vue';

const model = defineModel({ type: String, required: true });
const props = defineProps({
  tabs: { type: Array, required: true }, // [{ id, label, icon? }]
  label: { type: String, default: 'Abas' },
  idPrefix: { type: String, default: 'tab' },
});

const buttons = useTemplateRef('buttons');

// Aba ativa sempre visível na barra (ex.: aba recém-adicionada no fim da lista)
watch(model, async (id) => {
  await nextTick();
  const i = props.tabs.findIndex((t) => t.id === id);
  buttons.value?.[i]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
});

// Setas ←/→, Home e End trocam de aba (padrão de acessibilidade de tablist)
async function onKeydown(e, index) {
  const last = props.tabs.length - 1;
  const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: last }[e.key];
  if (next === undefined) return;
  e.preventDefault();
  const i = next < 0 ? last : next > last ? 0 : next;
  model.value = props.tabs[i].id;
  await nextTick();
  buttons.value?.[i]?.focus();
}
</script>

<template>
  <div class="tabs scroll-x" role="tablist" :aria-label="label">
    <button
      v-for="(tab, i) in tabs"
      :id="`${idPrefix}-${tab.id}`"
      ref="buttons"
      :key="tab.id"
      type="button"
      role="tab"
      class="tabs__item d-flex align-center"
      :class="{ 'is-active': model === tab.id }"
      :aria-selected="model === tab.id"
      :aria-controls="`${idPrefix}-panel-${tab.id}`"
      :tabindex="model === tab.id ? 0 : -1"
      @click="model = tab.id"
      @keydown="onKeydown($event, i)"
    >
      <component :is="tab.icon" v-if="tab.icon" :size="18" :stroke-width="1.75" />
      {{ tab.label }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.tabs {
  &__item {
    position: relative;
    height: 48px;
    gap: space(1);
    padding-inline: space(2);
    flex-shrink: 0;
    color: var(--text-muted);
    font-weight: 500;
    white-space: nowrap;
    transition: color 0.15s;

    &::after {
      content: '';
      position: absolute;
      inset: auto space(1) 0;
      height: 2px;
      border-radius: $r-full;
      background: transparent;
      transition: background 0.15s;
    }

    &:hover {
      color: var(--text);
    }

    &.is-active {
      color: var(--accent);

      &::after {
        background: var(--accent);
      }
    }
  }
}
</style>
