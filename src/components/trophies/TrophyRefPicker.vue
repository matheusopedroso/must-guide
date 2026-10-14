<script setup>
import { Trophy } from 'lucide-vue-next';
import SearchPicker from '@/components/ui/SearchPicker.vue';
import { TROPHY_TYPE_MAP } from '@/config/trophies';

// Lista para escolher o troféu a referenciar. Acha pelo nome em PT ou EN (guias gringos).
defineProps({
  trophies: { type: Array, required: true },
  exclude: { type: [Number, String, Array], default: null }, // o próprio troféu (ou vários: já escolhidos)
  initialTerm: { type: String, default: '' }, // ex.: texto selecionado no editor
});
defineEmits(['select', 'cancel']);

const names = (t) => [t.name, t.nameEn];
const typeOf = (t) => TROPHY_TYPE_MAP[t.type] ?? TROPHY_TYPE_MAP.bronze;
</script>

<template>
  <SearchPicker
    :items="trophies"
    :names="names"
    :exclude="exclude"
    :initial-term="initialTerm"
    placeholder="Buscar troféu"
    label="Referenciar troféu"
    empty="Nenhum troféu encontrado."
    @select="$emit('select', $event)"
    @cancel="$emit('cancel')"
  >
    <template #item="{ item: t }">
      <img v-if="t.icon" :src="t.icon" alt="" class="icon radius-1 shrink-0" loading="lazy" />
      <span class="text-sm fw-500 truncate flex-1">{{ t.name || 'Troféu oculto' }}</span>
      <Trophy :size="16" :stroke-width="2" class="shrink-0" :style="{ color: typeOf(t).color }" :aria-label="typeOf(t).label" />
    </template>
  </SearchPicker>
</template>

<style lang="scss" scoped>
.icon {
  width: 32px;
  height: 32px;
  object-fit: cover;
  background: var(--surface-2);
}
</style>
