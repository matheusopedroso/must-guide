<script setup>
import { useTemplateRef, watch } from 'vue';
import { TriangleAlert } from 'lucide-vue-next';
import EmptyState from '@/components/ui/EmptyState.vue';
import TrophyHeader from '@/components/trophies/TrophyHeader.vue';
import TrophyList from '@/components/trophies/TrophyList.vue';

// Aba "Troféus" da leitura: troca de versão (PS4/PS5), busca/filtros e as dicas, sem edição.
// Os dados vêm da página (compartilhados com a Visão geral). focus = troféu para rolar até ele.
const props = defineProps({
  versions: { type: Array, required: true },
  active: { type: Object, default: null },
  list: { type: Object, default: null },
  progress: { type: Object, default: null },
  loading: Boolean,
  error: { type: String, default: '' },
  getNote: { type: Function, required: true },
  backlinks: { type: Map, required: true },
  focus: { type: Number, default: null },
});
const emit = defineEmits(['select-version', 'focused']);

const listRef = useTemplateRef('trophyList');
watch(
  () => [props.focus, listRef.value],
  ([id, list]) => {
    if (id == null || !list) return;
    list.goTo(id);
    emit('focused');
  },
  { immediate: true, flush: 'post' },
);
</script>

<template>
  <EmptyState v-if="!versions.length" title="Sem lista de troféus" text="Este guia ainda não tem a lista de troféus vinculada." />

  <div v-else class="d-flex flex-column gap-2">
    <TrophyHeader
      :versions="versions"
      :active-id="active?.id"
      :list="list"
      :progress="progress"
      :loading="loading"
      readonly
      @select="$emit('select-version', $event)"
    />

    <EmptyState v-if="error" :icon="TriangleAlert" title="Não deu para carregar os troféus" :text="error" />
    <TrophyList v-else-if="list" ref="trophyList" :list="list" :progress="progress" :get-note="getNote" :backlinks="backlinks" readonly />
  </div>
</template>
