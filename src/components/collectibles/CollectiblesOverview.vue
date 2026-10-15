<script setup>
import { ref } from 'vue';
import { Check, LocateFixed, RotateCcw, TriangleAlert } from 'lucide-vue-next';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseModal from '@/components/ui/BaseModal.vue';

// Topo da aba Coletáveis na leitura (como a abertura do PowerPyx): quantos já pegou, um chip por tipo
// ("Artefato 3/12", que também filtra a lista), os perdíveis e as opções Esconder coletados e Compacto.
// Ações: "Próximo que falta" (rola até ele) e "Recomeçar" (desmarca todos, com confirmação — nova jogada).
defineProps({
  overall: { type: Object, required: true }, // { done, total }
  byType: { type: Array, default: () => [] }, // [{ type, done, total }]
  missable: { type: Number, default: 0 },
  canReset: Boolean,
});
const emit = defineEmits(['next', 'reset']);
const filter = defineModel('filter', { type: String, default: '' });
const hideDone = defineModel('hideDone', { type: Boolean, default: false });
const compact = defineModel('compact', { type: Boolean, default: false });

const pick = (value) => (filter.value = filter.value === value ? '' : value);

const confirming = ref(false);
function reset() {
  confirming.value = false;
  emit('reset');
}
</script>

<template>
  <div class="surface radius-2 p-2 d-flex flex-column gap-2">
    <div class="d-flex flex-column gap-1">
      <div class="d-flex align-center justify-between flex-wrap gap-1">
        <span class="text-sm"><strong>{{ overall.done }}</strong> de {{ overall.total }} coletáveis</span>
        <div class="d-flex align-center flex-wrap gap-2">
          <label class="checkbox text-sm"><input v-model="hideDone" type="checkbox" /> Esconder coletados</label>
          <label class="checkbox text-sm"><input v-model="compact" type="checkbox" /> Compacto</label>
        </div>
      </div>
      <ProgressBar :value="overall.done" :max="overall.total" tone="earned" />
    </div>

    <div v-if="overall.done < overall.total || (canReset && overall.done)" class="d-flex flex-wrap gap-1">
      <BaseButton v-if="overall.done < overall.total" :icon="LocateFixed" size="sm" @click="emit('next')">Próximo que falta</BaseButton>
      <BaseButton v-if="canReset && overall.done" :icon="RotateCcw" size="sm" variant="ghost" @click="confirming = true">Recomeçar</BaseButton>
    </div>

    <!-- Tipos: só vale mostrar com 2+ tipos ou perdíveis (um tipo só = o total acima) -->
    <div v-if="byType.length > 1 || missable" class="d-flex flex-wrap gap-1" role="group" aria-label="Filtrar coletáveis">
      <button type="button" class="chip chip--sm" :class="{ 'is-active': !filter }" :aria-pressed="!filter" @click="filter = ''">Todos</button>
      <button
        v-for="t in byType"
        :key="t.type"
        type="button"
        class="chip chip--sm"
        :class="{ 'is-active': filter === `type:${t.type}` }"
        :aria-pressed="filter === `type:${t.type}`"
        @click="pick(`type:${t.type}`)"
      >
        <Check v-if="t.done === t.total" :size="14" :stroke-width="3" class="chip__check" />
        {{ t.type || 'Sem tipo' }} <span class="chip__count">{{ t.done }}/{{ t.total }}</span>
      </button>
      <button
        v-if="missable"
        type="button"
        class="chip chip--sm"
        :class="{ 'is-active': filter === 'missable' }"
        :aria-pressed="filter === 'missable'"
        @click="pick('missable')"
      >
        <TriangleAlert :size="14" class="chip__warn" /> Perdíveis <span class="chip__count">{{ missable }}</span>
      </button>
    </div>

    <BaseModal v-model="confirming" title="Recomeçar os coletáveis?">
      <p class="text-muted">Os {{ overall.done }} coletáveis marcados voltam a ficar desmarcados (ex.: para uma nova jogada). Os troféus não mudam.</p>
      <template #footer>
        <span class="flex-1" />
        <BaseButton @click="confirming = false">Cancelar</BaseButton>
        <BaseButton variant="danger" :icon="RotateCcw" @click="reset">Desmarcar todos</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style lang="scss" scoped>
.chip__check {
  color: var(--earned);
}

.chip__warn {
  color: var(--warning);
}

.chip.is-active {
  .chip__check,
  .chip__warn {
    color: inherit;
  }
}
</style>
