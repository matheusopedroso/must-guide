<script setup>
import { computed, ref, watch } from 'vue';
import { useQueryParam } from '@/composables/useQueryParam';
import { ArrowDown, ArrowUp, CirclePlay, CornerDownRight, Image, Pencil, Plus, TriangleAlert } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import CollectibleItemModal from './CollectibleItemModal.vue';

// Coletáveis de uma região no editor: lista compacta (nome · tipo · local), adicionar rápido pelo nome
// (Enter) e editar os detalhes numa janela. "Mesmo lugar do anterior" aparece recuado, preso ao de cima.
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
const editingFirst = computed(() => props.items[0]?.id === editingId.value);
const modalOpen = computed({
  get: () => !!editingId.value,
  set: (v) => !v && (editingId.value = null),
});

// Vindo do lápis da leitura (?coletavel=…): abre a janela deste coletável, se for desta região, e tira o
// parâmetro da URL (não reabre ao gravar nem ao recarregar)
const target = useQueryParam('coletavel');
watch(
  [target, () => props.items.length],
  ([id]) => {
    if (!id || !props.items.some((i) => i.id === id)) return;
    editingId.value = id;
    target.value = '';
  },
  { immediate: true },
);

defineExpose({ edit: (id) => (editingId.value = id) });
</script>

<template>
  <section class="d-flex flex-column gap-1">
    <h4 class="text-sm fw-600">Coletáveis {{ regionName }} <span class="text-subtle">{{ items.length }}</span></h4>

    <ol v-if="items.length" class="clist d-flex flex-column gap-1">
      <li
        v-for="(it, i) in items"
        :key="it.id"
        class="clist__row d-flex align-center gap-2 radius-1 px-2 py-1"
        :class="{ 'is-joined': it.samePlace && i > 0 }"
      >
        <CornerDownRight v-if="it.samePlace && i > 0" :size="16" class="clist__n shrink-0" aria-label="Mesmo lugar do anterior" />
        <span v-else class="clist__n text-xs fw-600 shrink-0">{{ i + 1 }}</span>
        <button type="button" class="d-flex flex-column flex-1 min-w-0 text-left" @click="editingId = it.id">
          <span class="fw-600 truncate">{{ it.name || 'Sem nome' }}</span>
          <span class="text-xs text-muted truncate">{{ [it.type, it.samePlace && i > 0 ? 'mesmo lugar do anterior' : it.location].filter(Boolean).join(' · ') || 'Toque para completar os detalhes' }}</span>
        </button>
        <span class="d-inline-flex align-center gap-1 text-xs text-subtle shrink-0">
          <TriangleAlert v-if="it.missable" :size="14" class="text-warning" aria-label="Perdível" />
          <span v-if="it.uncounted" title="Não conta para o troféu">não conta</span>
          <CirclePlay v-if="it.video" :size="14" aria-label="Tem vídeo" />
          <template v-if="it.images?.length"><Image :size="14" :aria-label="`${it.images.length} imagem(ns)`" /> {{ it.images.length }}</template>
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
      :first="editingFirst"
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

.clist__row.is-joined {
  margin-left: space(4);
  max-width: calc(100% - #{space(4)});
  border-style: dashed;
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
