<script setup>
import { Eye, EyeOff } from 'lucide-vue-next';
import { useTemplateRef, watch } from 'vue';
import SearchInput from '@/components/ui/SearchInput.vue';
import ScrollRail from '@/components/ui/ScrollRail.vue';

// Barra da lista: busca, ordenação, mostrar ocultos e filtros
const search = defineModel('search', { type: String, default: '' });
const filter = defineModel('filter', { type: String, default: 'all' });
const sort = defineModel('sort', { type: String, default: 'default' });
const showHidden = defineModel('showHidden', { type: Boolean, default: false });
defineProps({
  sorts: { type: Array, required: true },
  filters: { type: Array, required: true },
});

// Chip escolhido (também pelo resumo do guia) sempre à vista no trilho
const rail = useTemplateRef('rail');
watch(filter, () => rail.value?.reveal());
</script>

<template>
  <div class="d-flex flex-column gap-2">
    <div class="d-flex flex-wrap gap-1">
      <SearchInput v-model="search" placeholder="Buscar troféu, descrição ou dica" class="toolbar__search flex-1" />
      <select v-model="sort" class="input toolbar__sort" aria-label="Ordenar">
        <option v-for="s in sorts" :key="s.id" :value="s.id">{{ s.label }}</option>
      </select>
      <button
        type="button"
        class="chip toolbar__hidden"
        :class="{ 'is-on': showHidden }"
        :aria-pressed="showHidden"
        :title="showHidden ? 'Esconder nomes dos troféus ocultos' : 'Mostrar nomes dos troféus ocultos'"
        @click="showHidden = !showHidden"
      >
        <component :is="showHidden ? Eye : EyeOff" :size="16" :stroke-width="1.75" /> Ocultos
      </button>
    </div>

    <ScrollRail ref="rail" label="Filtrar troféus">
      <button
        v-for="f in filters"
        :key="f.id"
        type="button"
        class="chip"
        :class="{ 'is-active': filter === f.id }"
        :aria-pressed="filter === f.id"
        @click="filter = f.id"
      >
        {{ f.label }} <span class="chip__count">{{ f.count }}</span>
      </button>
    </ScrollRail>
  </div>
</template>

<style lang="scss" scoped>
.toolbar__search {
  min-width: 200px;
}

.toolbar__sort {
  width: auto;
  flex: 0 1 220px;
}

.toolbar__hidden {
  height: 40px;
}
</style>
