<script setup>
import { nextTick, ref, useTemplateRef } from 'vue';
import { MessageSquareText, TriangleAlert, Wifi } from 'lucide-vue-next';

// Anotações do guia num troféu: marcar perdível/online e escrever a dica
const props = defineProps({ note: { type: Object, required: true } });
const emit = defineEmits(['update']);

const editing = ref(false);
const textarea = useTemplateRef('textarea');

async function openTip() {
  editing.value = true;
  await nextTick();
  textarea.value?.focus();
}

const toggle = (field) => emit('update', { [field]: !props.note[field] });
</script>

<template>
  <div class="d-flex flex-column gap-1">
    <p v-if="note.tip && !editing" class="tip pre-line text-sm radius-1 px-2 py-1" @click="openTip">{{ note.tip }}</p>

    <textarea
      v-if="editing"
      ref="textarea"
      class="input text-sm"
      rows="3"
      placeholder="Dica para este troféu: onde, quando, o que evitar…"
      :value="note.tip"
      @input="emit('update', { tip: $event.target.value })"
      @blur="editing = false"
      @keydown.esc="editing = false"
    />

    <div class="d-flex flex-wrap gap-1">
      <button type="button" class="chip chip--sm" :class="{ 'is-on': note.missable }" :aria-pressed="note.missable" @click="toggle('missable')">
        <TriangleAlert :size="14" :stroke-width="1.75" /> Perdível
      </button>
      <button type="button" class="chip chip--sm" :class="{ 'is-on': note.online }" :aria-pressed="note.online" @click="toggle('online')">
        <Wifi :size="14" :stroke-width="1.75" /> Online
      </button>
      <button v-if="!editing" type="button" class="chip chip--sm" :class="{ 'is-on': note.tip }" @click="openTip">
        <MessageSquareText :size="14" :stroke-width="1.75" /> {{ note.tip ? 'Editar dica' : 'Dica' }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tip {
  background: var(--surface-2);
  border-left: 2px solid var(--accent);
  cursor: text;
}
</style>
