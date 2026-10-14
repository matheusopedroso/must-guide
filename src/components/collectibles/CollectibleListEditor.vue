<script setup>
import { computed, ref } from 'vue';
import { ArrowDown, ArrowUp, Image, Pencil, Plus } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import CollectibleItemModal from './CollectibleItemModal.vue';

// Coletáveis de uma região no editor: lista compacta (nome · tipo · local), adicionar rápido pelo nome
// (Enter) e editar os detalhes numa janela.
const props = defineProps({
  items: { type: Array, default: () => [] },
  types: { type: Array, default: () => [] },
  regionName: { type: String, default: 'esta área' },
});
const emit = defineEmits(['add', 'update', 'remove', 'move']);

const newName = ref('');
function quickAdd() {
  if (!newName.value.trim()) return;
  emit('add', newName.value);
  newName.value = '';
}

const editingId = ref(null);
const editing = computed(() => props.items.find((i) => i.id === editingId.value) ?? null);
const modalOpen = computed({
  get: () => !!editingId.value,
  set: (v) => !v && (editingId.value = null),
});

defineExpose({ edit: (id) => (editingId.value = id) });
</script>

<template>
  <section class="d-flex flex-column gap-1">
    <h4 class="text-sm fw-600">Coletáveis {{ regionName }} <span class="text-subtle">{{ items.length }}</span></h4>

    <ol v-if="items.length" class="clist d-flex flex-column gap-1">
      <li v-for="(it, i) in items" :key="it.id" class="clist__row d-flex align-center gap-2 radius-1 px-2 py-1">
        <span class="clist__n text-xs fw-600 shrink-0">{{ i + 1 }}</span>
        <button type="button" class="d-flex flex-column flex-1 min-w-0 text-left" @click="editingId = it.id">
          <span class="fw-600 truncate">{{ it.name || 'Sem nome' }}</span>
          <span class="text-xs text-muted truncate">{{ [it.type, it.location].filter(Boolean).join(' · ') || 'Toque para completar os detalhes' }}</span>
        </button>
        <span v-if="it.images?.length" class="d-inline-flex align-center gap-1 text-xs text-subtle" :title="`${it.images.length} imagem(ns)`">
          <Image :size="14" /> {{ it.images.length }}
        </span>
        <BaseButton :icon="ArrowUp" icon-only size="sm" variant="ghost" :disabled="i === 0" aria-label="Subir" @click="emit('move', it.id, -1)" />
        <BaseButton :icon="ArrowDown" icon-only size="sm" variant="ghost" :disabled="i === items.length - 1" aria-label="Descer" @click="emit('move', it.id, 1)" />
        <BaseButton :icon="Pencil" icon-only size="sm" variant="ghost" aria-label="Editar coletável" @click="editingId = it.id" />
      </li>
    </ol>

    <form class="d-flex gap-1" @submit.prevent="quickAdd">
      <input v-model="newName" class="input flex-1" placeholder="Nome do coletável e Enter para adicionar" aria-label="Nome do novo coletável" />
      <BaseButton :icon="Plus" type="submit" :disabled="!newName.trim()">Adicionar</BaseButton>
    </form>

    <CollectibleItemModal
      v-model="modalOpen"
      :item="editing"
      :types="types"
      @save="emit('update', editingId, $event)"
      @remove="emit('remove', editingId)"
    />
  </section>
</template>

<style lang="scss" scoped>
.clist__row {
  border: 1px solid var(--border);
  background: var(--surface);
}

.clist__n {
  width: 24px;
  color: var(--text-subtle);
  text-align: right;
}

.text-left {
  text-align: left;
}
</style>
