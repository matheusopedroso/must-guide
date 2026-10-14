<script setup>
// Abas em pílula das páginas de detalhe (igual às .abas-pagina do Must Watch): dividem a largura,
// a ativa ganha o fundo de destaque. Grudam abaixo da PageBar ao rolar.
const model = defineModel({ type: String, required: true });
defineProps({
  tabs: { type: Array, required: true }, // [{ id, label, count? }]
  label: { type: String, default: 'Seções' },
});
</script>

<template>
  <nav class="ptabs d-flex" role="tablist" :aria-label="label">
    <button
      v-for="t in tabs"
      :key="t.id"
      type="button"
      role="tab"
      class="ptabs__tab d-flex align-center justify-center gap-1"
      :class="{ 'is-active': model === t.id }"
      :aria-selected="model === t.id"
      @click="model = t.id"
    >
      {{ t.label }}
      <span v-if="t.count != null" class="ptabs__count">{{ t.count }}</span>
    </button>
  </nav>
</template>

<style lang="scss" scoped>
.ptabs {
  // Medidas do Must Watch (.abas-pagina): padding/gap 4, botões com 8px, texto 11px (10px no celular)
  position: sticky;
  top: calc(var(--nav-offset) + var(--pbar-gap) + var(--pbar-height) + #{space(1)}); // navegação + PageBar
  z-index: 25;
  gap: $space-half;
  width: min(700px, 100%);
  margin: 0 auto space(4);
  padding: $space-half;
  border: 1px solid var(--border);
  border-radius: $r-full;
  background: var(--nav-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  overflow-x: auto;
  scrollbar-width: none;
  transition: top 0.22s $ease;

  &::-webkit-scrollbar {
    display: none;
  }

  &__tab {
    flex: 1 1 0;
    min-width: 0;
    padding: space(1);
    border-radius: $r-full;
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
    transition: background 0.15s, color 0.15s;

    &:hover {
      color: var(--text);
    }

    &.is-active {
      background: var(--accent);
      color: var(--on-accent);
    }
  }

  &__count {
    opacity: 0.7;
  }

  @media (max-width: 500px) {
    &__tab {
      padding: space(1) $space-half;
      font-size: 10px;
      letter-spacing: 0.04em;
    }
  }
}
</style>
