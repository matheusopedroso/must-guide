<script setup>
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';
import BaseButton from '@/components/ui/BaseButton.vue';

// Contador para o meio do texto (como o "6/18 Boss Killed" do TrueAchievements): quanto já foi feito, o total,
// um texto e, se quiser, o troféu ligado (vira link para ele e o total vem da PSN quando ela informa).
// Com um trecho selecionado no texto, ele vira o texto do contador.
const props = defineProps({
  trophies: { type: Array, default: () => [] },
  initialLabel: { type: String, default: '' },
});
const emit = defineEmits(['insert', 'cancel']);

const done = ref('');
const total = ref('');
const label = ref(props.initialLabel);
const trophyId = ref('');
const first = useTemplateRef('first');
onMounted(() => first.value?.focus());

const trophy = computed(() => props.trophies.find((t) => t.id === Number(trophyId.value)) ?? null);
// Escolheu o troféu: total da PSN (troféus de PS5 com contador) e o nome dele, se ainda estiverem vazios
watch(trophy, (t) => {
  if (!t) return;
  if (!total.value && t.target) total.value = String(t.target);
  if (!label.value.trim()) label.value = t.name;
});

const valid = computed(() => done.value !== '' && Number(done.value) >= 0);
const preview = computed(() => `${done.value || 0}${total.value ? `/${total.value}` : ''} ${label.value.trim()}`.trim());

function submit() {
  if (!valid.value) return;
  emit('insert', { done: Number(done.value), total: Number(total.value) || null, label: label.value.trim(), trophy: trophy.value });
}
</script>

<template>
  <form class="counter surface radius-2 p-2 d-flex flex-column gap-2" @submit.prevent="submit" @keydown.esc.prevent="emit('cancel')">
    <p class="text-sm fw-600">Contador no texto</p>
    <div class="d-flex align-end gap-1">
      <label class="field">
        <span class="field__label">Feito</span>
        <input ref="first" v-model="done" type="number" min="0" inputmode="numeric" class="input counter__num" placeholder="6" />
      </label>
      <span class="counter__slash text-muted">/</span>
      <label class="field">
        <span class="field__label">Total</span>
        <input v-model="total" type="number" min="1" inputmode="numeric" class="input counter__num" placeholder="18" />
      </label>
    </div>
    <label class="field">
      <span class="field__label">Texto</span>
      <input v-model="label" class="input" placeholder="Ex.: chefes derrotados" />
    </label>
    <label v-if="trophies.length" class="field">
      <span class="field__label">Troféu ligado (opcional)</span>
      <select v-model="trophyId" class="input">
        <option value="">Nenhum</option>
        <option v-for="t in trophies" :key="t.id" :value="t.id">{{ t.name || 'Troféu oculto' }}{{ t.target ? ` (${t.target})` : '' }}</option>
      </select>
    </label>
    <p class="text-xs text-muted">Fica assim: <strong class="counter__preview">{{ preview }}</strong></p>
    <div class="d-flex justify-end gap-1">
      <BaseButton size="sm" variant="ghost" @click="emit('cancel')">Cancelar</BaseButton>
      <BaseButton size="sm" variant="primary" type="submit" :disabled="!valid">Inserir</BaseButton>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.counter {
  box-shadow: var(--shadow);

  &__num {
    width: 96px;
  }

  &__slash {
    padding-bottom: space(1);
    font-size: 20px;
  }

  &__preview {
    color: var(--text);
  }
}
</style>
