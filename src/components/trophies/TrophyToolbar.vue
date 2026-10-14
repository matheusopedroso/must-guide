<script setup>
import { ArrowUpDown, Eye, EyeOff, ListFilter } from 'lucide-vue-next';
import SearchInput from '@/components/ui/SearchInput.vue';
import IconSelect from '@/components/ui/IconSelect.vue';

// Barra da lista numa linha: busca · filtro · ordem · ocultos
// (no celular: busca + ocultos em cima, filtro e ordem dividindo a linha de baixo)
const search = defineModel('search', { type: String, default: '' });
const filter = defineModel('filter', { type: String, default: 'all' });
const sort = defineModel('sort', { type: String, default: 'default' });
const showHidden = defineModel('showHidden', { type: Boolean, default: false });
defineProps({
  sorts: { type: Array, required: true },
  filters: { type: Array, required: true }, // [{ label, items: [{ id, label, count }] }]
});
</script>

<template>
  <div class="toolbar d-flex flex-wrap align-center gap-1">
    <SearchInput v-model="search" placeholder="Buscar troféu ou dica" class="toolbar__search" />
    <button
      type="button"
      class="toolbar__eye chip shrink-0 tooltip-left"
      :class="{ 'is-on': showHidden }"
      :aria-pressed="showHidden"
      :aria-label="showHidden ? 'Esconder nomes dos ocultos' : 'Mostrar nomes dos ocultos'"
      :data-tooltip="showHidden ? 'Esconder ocultos' : 'Mostrar ocultos'"
      @click="showHidden = !showHidden"
    >
      <component :is="showHidden ? Eye : EyeOff" :size="16" :stroke-width="1.75" />
    </button>

    <IconSelect v-model="filter" :icon="ListFilter" label="Filtrar" :active="filter !== 'all'" class="toolbar__select">
      <template v-for="g in filters" :key="g.label">
        <optgroup v-if="g.label" :label="g.label">
          <option v-for="f in g.items" :key="f.id" :value="f.id">{{ f.label }} ({{ f.count }})</option>
        </optgroup>
        <template v-else>
          <option v-for="f in g.items" :key="f.id" :value="f.id">{{ f.label }} ({{ f.count }})</option>
        </template>
      </template>
    </IconSelect>

    <IconSelect v-model="sort" :icon="ArrowUpDown" label="Ordenar" class="toolbar__select">
      <option v-for="s in sorts" :key="s.id" :value="s.id">{{ s.label }}</option>
    </IconSelect>

  </div>
</template>

<style lang="scss" scoped>
.toolbar {
  &__search {
    flex: 1 1 calc(100% - 48px); // celular: divide a linha só com o botão de ocultos
    min-width: 0;

    @include up(md) {
      flex-basis: 0;
    }
  }

  &__select {
    flex: 1 1 calc(50% - #{$space-half});
    min-width: 0;

    @include down(md) {
      font-size: 14px;
    }

    @include up(md) {
      flex: 0 0 200px;
    }
  }

  &__eye {
    @include up(md) {
      order: 1; // no desktop vai para o fim da linha
    }

    width: 40px;
    height: 40px;
    justify-content: center;
    padding: 0;
    border-radius: $r1;
  }
}
</style>
