<script setup>
import { reactive, watch } from 'vue';
import { Clock, Gauge, Repeat } from 'lucide-vue-next';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import NumberStepper from '@/components/ui/NumberStepper.vue';
import DifficultyPicker from './DifficultyPicker.vue';
import DifficultyBadge from './DifficultyBadge.vue';
import { GUIDE_STATS } from '@/config/guide';

// Edição da visão geral (dificuldade, jogadas, horas). Edita uma cópia e grava só no "Salvar".
const open = defineModel({ type: Boolean, default: false });
const props = defineProps({ stats: { type: Object, required: true } });
const emit = defineEmits(['save']);

const LIMITS = Object.fromEntries(GUIDE_STATS.map((s) => [s.id, s]));
const form = reactive({ difficulty: 0, playthroughs: 0, hours: 0 });

watch(open, (v) => v && Object.assign(form, { difficulty: 0, playthroughs: 0, hours: 0, ...props.stats }));

const clear = () => Object.assign(form, { difficulty: 0, playthroughs: 0, hours: 0 });

function save() {
  emit('save', { ...form });
  open.value = false;
}
</script>

<template>
  <BaseModal v-model="open" title="Visão geral do guia" description="Valores para conseguir a platina. Deixe em branco o que não souber.">
    <div class="d-flex flex-column gap-3">
      <section class="d-flex flex-column gap-1">
        <div class="d-flex align-center justify-between gap-1">
          <h4 class="section-title d-flex align-center gap-1"><Gauge :size="16" /> Dificuldade</h4>
          <DifficultyBadge v-if="form.difficulty" :value="form.difficulty" show-label />
          <span v-else class="text-xs text-subtle">Não informada</span>
        </div>
        <DifficultyPicker v-model="form.difficulty" />
      </section>

      <div class="numbers">
        <section class="d-flex flex-column gap-1">
          <h4 class="section-title d-flex align-center gap-1"><Repeat :size="16" /> Jogadas</h4>
          <NumberStepper v-model="form.playthroughs" label="Jogadas" :min="LIMITS.playthroughs.min" :max="LIMITS.playthroughs.max" suffix="×" />
          <p class="text-xs text-subtle">Quantas vezes zerar</p>
        </section>
        <section class="d-flex flex-column gap-1">
          <h4 class="section-title d-flex align-center gap-1"><Clock :size="16" /> Horas</h4>
          <NumberStepper v-model="form.hours" label="Horas" :min="LIMITS.hours.min" :max="LIMITS.hours.max" suffix="h" />
          <p class="text-xs text-subtle">Tempo aproximado</p>
        </section>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="ghost" size="sm" @click="clear">Limpar</BaseButton>
      <span class="flex-1" />
      <BaseButton @click="open = false">Cancelar</BaseButton>
      <BaseButton variant="primary" @click="save">Salvar</BaseButton>
    </template>
  </BaseModal>
</template>

<style lang="scss" scoped>
.section-title {
  font-size: 14px;
  font-weight: 600;

  svg {
    color: var(--accent);
  }
}

.numbers {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: space(2);
}
</style>
