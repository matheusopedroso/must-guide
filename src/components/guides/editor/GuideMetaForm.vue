<script setup>
import { GUIDE_STATUS } from '@/config/status';

// Edita direto o objeto reativo do rascunho (o dono é useGuideDraft)
defineProps({ draft: { type: Object, required: true } });
</script>

<template>
  <div class="surface radius-2 p-3 d-flex flex-column gap-2">
    <label class="field">
      <span class="field__label">Título</span>
      <input v-model="draft.title" class="input" required />
    </label>

    <label class="field">
      <span class="field__label">Resumo / dicas gerais</span>
      <textarea v-model="draft.summary" class="input" rows="3" placeholder="Roteiro, ordem recomendada, avisos…" />
    </label>

    <div class="meta-grid d-grid gap-2">
      <label class="field">
        <span class="field__label">Dificuldade (1–10)</span>
        <input v-model.number="draft.difficulty" class="input" type="number" min="1" max="10" />
      </label>
      <label class="field">
        <span class="field__label">Horas estimadas</span>
        <input v-model.number="draft.hours" class="input" type="number" min="0" placeholder="—" />
      </label>
      <label class="field">
        <span class="field__label">Jogadas mínimas</span>
        <input v-model.number="draft.playthroughs" class="input" type="number" min="1" />
      </label>
      <label class="field">
        <span class="field__label">Status</span>
        <select v-model="draft.status" class="input">
          <option v-for="(label, id) in GUIDE_STATUS" :key="id" :value="id">{{ label }}</option>
        </select>
      </label>
    </div>

    <div class="d-flex flex-wrap gap-3">
      <label class="checkbox"><input v-model="draft.hasOnline" type="checkbox" /> Tem troféus online</label>
      <label class="checkbox"><input v-model="draft.hasMissables" type="checkbox" /> Tem perdíveis</label>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.meta-grid {
  grid-template-columns: repeat(2, 1fr);

  @include up(md) {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
