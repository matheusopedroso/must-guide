<script setup>
import { nextTick, useTemplateRef, watch } from 'vue';
import { ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import { pageName } from '@/utils/pages';

// Páginas de uma aba paginada no editor (Guia): lista das páginas (troca a aberta), adicionar e, na aberta,
// título, mover para trás/frente e remover. Quem decide é o pai (usePages).
const props = defineProps({
  pages: { type: Array, required: true },
  index: { type: Number, required: true },
  placeholder: { type: String, default: 'Título da página' },
});
const emit = defineEmits(['select', 'add', 'rename', 'move', 'remove']);

// Página aberta sempre à vista na lista (muitas páginas rolam de lado)
const list = useTemplateRef('list');
watch(
  () => props.index,
  async () => {
    await nextTick();
    list.value?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  },
);
</script>

<template>
  <section class="pnav surface radius-2 p-2 d-flex flex-column gap-2">
    <div class="d-flex align-center justify-between gap-1">
      <p class="kicker">Páginas <span class="text-subtle">· {{ pages.length }}</span></p>
      <BaseButton :icon="Plus" size="sm" @click="emit('add')">Nova página</BaseButton>
    </div>

    <nav ref="list" class="pnav__list d-flex gap-1" aria-label="Páginas do guia">
      <button
        v-for="(p, i) in pages"
        :key="p.id"
        type="button"
        class="chip shrink-0"
        :class="{ 'is-active': i === index }"
        :aria-current="i === index ? 'page' : undefined"
        @click="emit('select', i)"
      >
        <span class="chip__count">{{ i + 1 }}</span> {{ pageName(p, i) }}
      </button>
    </nav>

    <div v-if="pages[index]" class="pnav__current d-flex align-center flex-wrap gap-1">
      <span class="kicker shrink-0">Página {{ index + 1 }}</span>
      <input
        :value="pages[index].title"
        class="input pnav__title"
        :placeholder="placeholder"
        aria-label="Título da página"
        @input="emit('rename', $event.target.value)"
      />
      <div class="d-flex gap-1 ml-auto">
        <BaseButton :icon="ArrowLeft" icon-only size="sm" variant="ghost" :disabled="index === 0" aria-label="Mover a página para trás" data-tooltip="Para trás" @click="emit('move', -1)" />
        <BaseButton :icon="ArrowRight" icon-only size="sm" variant="ghost" :disabled="index === pages.length - 1" aria-label="Mover a página para frente" data-tooltip="Para frente" @click="emit('move', 1)" />
        <BaseButton :icon="Trash2" icon-only size="sm" variant="danger" class="tooltip-left" aria-label="Remover página" data-tooltip="Remover página" @click="emit('remove')" />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.pnav {
  &__list {
    overflow-x: auto;
    scrollbar-width: thin;
    padding-bottom: space(1);
  }

  &__title {
    flex: 1 1 0;
    min-width: 0;
    font-weight: 600;

    @include down(md) {
      flex-basis: 100%;
      order: 1; // linha de baixo
    }
  }
}
</style>
