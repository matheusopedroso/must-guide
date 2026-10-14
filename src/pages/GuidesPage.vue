<script setup>
import { computed, onMounted, ref } from 'vue';
import { BookOpen } from 'lucide-vue-next';
import PageHeader from '@/components/ui/PageHeader.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import LoadingState from '@/components/ui/LoadingState.vue';
import SearchInput from '@/components/ui/SearchInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import GuideCard from '@/components/guides/GuideCard.vue';
import { useGuidesStore } from '@/stores/guides';
import { GUIDE_STATUS } from '@/config/status';
import { normalizeText } from '@/utils/format';

const store = useGuidesStore();
const loading = ref(true);
const text = ref('');
const status = ref('all');

onMounted(async () => {
  try {
    await store.loadList();
  } finally {
    loading.value = false;
  }
});

const guides = computed(() => {
  const q = normalizeText(text.value.trim());
  return store
    .listFor('all')
    .filter((g) => status.value === 'all' || g.status === status.value)
    .filter((g) => !q || normalizeText(`${g.title} ${g.game?.title ?? ''}`).includes(q));
});
</script>

<template>
  <div class="container page">
    <PageHeader title="Guias" subtitle="Para criar um guia, abra o jogo na biblioteca." />

    <LoadingState v-if="loading" />

    <EmptyState
      v-else-if="!store.listFor('all').length"
      :icon="BookOpen"
      title="Nenhum guia cadastrado"
      text="Abra um jogo da biblioteca e toque em “Novo guia”."
    >
      <BaseButton to="/">Ir para a biblioteca</BaseButton>
    </EmptyState>

    <template v-else>
      <div class="d-flex flex-column gap-2 mb-3">
        <SearchInput v-model="text" placeholder="Buscar guia ou jogo" class="search" />
        <div class="scroll-x gap-1">
          <button type="button" class="chip" :class="{ 'is-active': status === 'all' }" @click="status = 'all'">Todos</button>
          <button
            v-for="(label, id) in GUIDE_STATUS"
            :key="id"
            type="button"
            class="chip"
            :class="{ 'is-active': status === id }"
            @click="status = id"
          >
            {{ label }}
          </button>
        </div>
      </div>

      <div v-if="guides.length" class="guides-grid d-grid gap-2">
        <GuideCard v-for="g in guides" :key="g.id" :guide="g" />
      </div>
      <p v-else class="text-muted py-4">Nenhum guia encontrado.</p>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.search {
  max-width: 400px;
}

.guides-grid {
  @include up(md) {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
