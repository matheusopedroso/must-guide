<script setup>
import { Link2 } from 'lucide-vue-next';
import { TROPHY_TYPE_MAP } from '@/config/trophies';

// Editor: liga cada tipo de coletável ao troféu dele ("Artefato" → "Historiador"). Na leitura o chip do tipo
// mostra o troféu e a página do troféu mostra o progresso dos coletáveis. model: guide.collectibleTypes.
const model = defineModel({ type: Object, default: () => ({}) });
defineProps({
  types: { type: Array, required: true }, // tipos usados no guia
  trophies: { type: Array, default: () => [] }, // lista da versão principal
});

function setTrophy(type, value) {
  const next = { ...model.value };
  if (value) next[type] = { ...next[type], trophy: Number(value) };
  else delete next[type];
  model.value = next;
}
const label = (t) => `${TROPHY_TYPE_MAP[t.type]?.label ?? ''} · ${t.name || 'Troféu oculto'}`;
</script>

<template>
  <details class="types surface radius-2 p-2">
    <summary class="d-flex align-center gap-1 text-sm fw-600">
      <Link2 :size="16" /> Tipos ligados a troféus
      <span class="text-subtle fw-500">{{ types.filter((t) => model?.[t]?.trophy != null).length }}/{{ types.length }}</span>
    </summary>
    <p class="text-xs text-muted mt-1 mb-2">
      Ex.: "Artefato" → troféu de pegar todos os artefatos. Na leitura o chip do tipo mostra o troféu, e a página do troféu
      mostra quantos já foram coletados.
    </p>
    <div class="d-flex flex-column gap-1">
      <label v-for="type in types" :key="type" class="types__row d-flex align-center gap-2">
        <span class="types__name text-sm fw-600 truncate">{{ type }}</span>
        <select
          class="input flex-1"
          :value="model?.[type]?.trophy ?? ''"
          :aria-label="`Troféu do tipo ${type}`"
          :disabled="!trophies.length"
          @change="setTrophy(type, $event.target.value)"
        >
          <option value="">Sem troféu</option>
          <option v-for="t in trophies" :key="t.id" :value="t.id">{{ label(t) }}</option>
        </select>
      </label>
    </div>
  </details>
</template>

<style lang="scss" scoped>
.types {
  summary {
    cursor: pointer;
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }
  }

  &__name {
    flex: 0 0 160px;

    @include down(sm) {
      flex-basis: 104px;
    }
  }
}
</style>
