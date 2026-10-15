<script setup>
import { computed } from 'vue';
import { ExternalLink, HeartHandshake } from 'lucide-vue-next';
import { creditsOf } from '@/utils/collectibles';

// Créditos do guia na leitura (fim da página, em todas as abas): quem ajudou e com o quê (rota, imagens, vídeo…).
// Junta os créditos do guia com os nomes citados nos coletáveis.
const props = defineProps({ guide: { type: Object, required: true } });
const credits = computed(() => creditsOf(props.guide));
</script>

<template>
  <section v-if="credits.length" class="credits surface radius-2 p-2 d-flex flex-column gap-2" aria-labelledby="credits-title">
    <h2 id="credits-title" class="kicker d-flex align-center gap-1"><HeartHandshake :size="14" /> Créditos</h2>
    <ul class="credits__list">
      <li v-for="c in credits" :key="c.id" class="d-flex align-baseline flex-wrap gap-1 text-sm">
        <a v-if="c.url" :href="c.url" target="_blank" rel="noopener noreferrer" class="credits__name d-inline-flex align-center gap-1 fw-600">
          {{ c.name }} <ExternalLink :size="12" />
        </a>
        <strong v-else>{{ c.name }}</strong>
        <span v-if="c.role" class="text-muted">· {{ c.role }}</span>
      </li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
.credits {
  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: space(1) space(3);
  }

  &__name {
    color: var(--accent);

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
