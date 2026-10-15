<script setup>
import { computed } from 'vue';
import { Gem } from 'lucide-vue-next';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import { useCollectibleContext } from '@/composables/guide/useCollectibles';
import { summarizeByType, typesOfTrophy } from '@/utils/collectibles';

// Página do troféu: coletáveis dos tipos ligados a ele ("Artefato" → este troféu), com o seu progresso e o
// atalho para a aba Coletáveis já filtrada no tipo. Some se nenhum tipo estiver ligado ao troféu.
const props = defineProps({
  guideId: { type: String, required: true },
  trophyId: { type: Number, required: true },
});

const col = useCollectibleContext();
const rows = computed(() => {
  const types = new Set(typesOfTrophy(col?.types?.value, props.trophyId));
  if (!types.size) return [];
  const isDone = (id) => !!col.collected?.value.has(id);
  return summarizeByType(col.items.value, isDone).filter((r) => types.has(r.type));
});
const to = (type) => ({ name: 'guide-view', params: { id: props.guideId }, query: { aba: 'coletaveis', tipo: type } });
</script>

<template>
  <section v-if="rows.length" class="d-flex flex-column gap-2">
    <h2 class="section-heading d-flex align-center gap-1"><Gem :size="18" /> Coletáveis deste troféu</h2>
    <RouterLink
      v-for="r in rows"
      :key="r.type"
      :to="to(r.type)"
      class="tcol surface radius-2 p-2 d-flex flex-column gap-1"
      :aria-label="`${r.type}: ${r.done} de ${r.total} — ver na aba Coletáveis`"
    >
      <span class="d-flex align-center justify-between gap-1 text-sm">
        <strong>{{ r.type }}</strong>
        <span :class="r.done === r.total ? 'text-earned fw-600' : 'text-muted'">{{ r.done }}/{{ r.total }}{{ r.done === r.total ? ' ✓' : '' }}</span>
      </span>
      <ProgressBar :value="r.done" :max="r.total" tone="earned" />
      <span class="text-xs text-accent">Ver na aba Coletáveis →</span>
    </RouterLink>
  </section>
</template>

<style lang="scss" scoped>
.tcol {
  border: 1px solid transparent;
  transition: border-color 0.15s;

  &:hover {
    border-color: var(--border-strong);
  }
}
</style>
