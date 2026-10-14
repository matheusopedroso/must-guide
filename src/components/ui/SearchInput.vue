<script setup>
import { onMounted, useTemplateRef } from 'vue';
import { Search, X } from 'lucide-vue-next';

const model = defineModel({ type: String, default: '' });
const props = defineProps({
  placeholder: { type: String, default: 'Buscar' },
  size: { type: String, default: 'md' }, // md | lg
  autofocus: Boolean,
  inputAttrs: { type: Object, default: () => ({}) }, // atributos/eventos extras do <input> (ex.: combobox)
});

// Foco automático só com mouse: no celular abriria o teclado cobrindo a tela
const input = useTemplateRef('input');
onMounted(() => {
  if (props.autofocus && matchMedia('(pointer: fine)').matches) input.value?.focus();
});

function clear() {
  model.value = '';
  input.value?.focus();
}

defineExpose({ focus: () => input.value?.focus() });
</script>

<template>
  <label class="search d-flex align-center" :class="`search--${size}`">
    <Search :size="size === 'lg' ? 20 : 18" :stroke-width="1.75" class="search__icon" />
    <input
      ref="input"
      v-model="model"
      type="text"
      inputmode="search"
      enterkeyhint="search"
      autocomplete="off"
      spellcheck="false"
      class="input"
      :placeholder="placeholder"
      :aria-label="placeholder"
      v-bind="inputAttrs"
    />
    <button v-if="model" type="button" class="search__clear d-flex align-center justify-center" aria-label="Limpar" @click="clear">
      <X :size="16" />
    </button>
  </label>
</template>

<style lang="scss" scoped>
.search {
  position: relative;

  &__icon {
    position: absolute;
    left: space(2) - $space-half;
    color: var(--text-subtle);
    pointer-events: none;
  }

  .input {
    padding-left: space(5);
    padding-right: space(5);
  }

  &__clear {
    position: absolute;
    right: space(1);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: var(--text-subtle);

    &:hover {
      background: var(--surface-hover);
      color: var(--text);
    }
  }

  &--lg {
    .input {
      min-height: 56px;
      padding-left: space(6);
      border-radius: $r2;
      font-size: 17px;
      box-shadow: var(--shadow);
    }

    .search__icon {
      left: space(2);
    }

    .search__clear {
      right: space(1) + $space-half;
    }
  }
}
</style>
