<script setup>
import { computed } from 'vue';
import { providerInfo } from '@/config/providers';

// Crédito obrigatório da fonte dos dados (o RAWG exige link nas páginas que usam os dados)
const props = defineProps({
  providers: { type: Array, default: () => [] },
});

const items = computed(() => [...new Set(props.providers)].map(providerInfo).filter(Boolean));
</script>

<template>
  <p v-if="items.length" class="text-xs text-subtle">
    Dados de jogos:
    <template v-for="(p, i) in items" :key="p.name">
      <a :href="p.url" target="_blank" rel="noopener" class="credit-link">{{ p.name }}</a>
      <span v-if="i < items.length - 1"> · </span>
    </template>
  </p>
</template>

<style lang="scss" scoped>
.credit-link {
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: var(--accent);
  }
}
</style>
