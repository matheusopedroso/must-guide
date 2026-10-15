<script setup>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

// Anterior / Próxima no fim de uma página (páginas do guia, troféus): cartões com o nome do destino.
// Cada lado: { name, to? } — com `to` é link; sem, emite 'go' ('prev' | 'next').
defineProps({
  prev: { type: Object, default: null },
  next: { type: Object, default: null },
  label: { type: String, default: 'Navegar' },
  masc: Boolean, // "Próximo" (troféu) em vez de "Próxima" (página)
});
defineEmits(['go']);
</script>

<template>
  <nav v-if="prev || next" class="pager" :aria-label="label">
    <component
      :is="prev.to ? 'RouterLink' : 'button'"
      v-if="prev"
      :to="prev.to"
      :type="prev.to ? undefined : 'button'"
      class="pager__btn surface radius-2 p-2 d-flex align-center gap-1"
      @click="!prev.to && $emit('go', 'prev')"
    >
      <ChevronLeft :size="20" class="shrink-0" />
      <span class="d-flex flex-column min-w-0">
        <span class="text-xs text-muted">Anterior</span>
        <span class="fw-600 truncate">{{ prev.name }}</span>
      </span>
    </component>
    <component
      :is="next.to ? 'RouterLink' : 'button'"
      v-if="next"
      :to="next.to"
      :type="next.to ? undefined : 'button'"
      class="pager__btn pager__btn--next surface radius-2 p-2 d-flex align-center gap-1"
      @click="!next.to && $emit('go', 'next')"
    >
      <span class="d-flex flex-column min-w-0">
        <span class="text-xs text-muted">{{ masc ? 'Próximo' : 'Próxima' }}</span>
        <span class="fw-600 truncate">{{ next.name }}</span>
      </span>
      <ChevronRight :size="20" class="shrink-0" />
    </component>
  </nav>
</template>

<style lang="scss" scoped>
.pager {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: space(2);

  &__btn {
    text-align: left;
    transition: background 0.15s, border-color 0.15s;

    &:hover {
      background: var(--surface-hover);
    }

    &--next {
      grid-column: 2;
      justify-content: flex-end;
      text-align: right;

      span {
        align-items: flex-end;
      }
    }
  }
}
</style>
