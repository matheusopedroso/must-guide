<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { BookOpen, ExternalLink, Plus, Trash2 } from 'lucide-vue-next';
import BackButton from '@/components/ui/BackButton.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import GameCover from '@/components/ui/GameCover.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import LoadingState from '@/components/ui/LoadingState.vue';
import StatusPicker from '@/components/games/StatusPicker.vue';
import GuideCard from '@/components/guides/GuideCard.vue';
import { useLibraryStore } from '@/stores/library';
import { useGuidesStore } from '@/stores/guides';

const props = defineProps({ id: { type: String, required: true } });

const router = useRouter();
const library = useLibraryStore();
const guidesStore = useGuidesStore();

const game = ref(null);
const loading = ref(true);
const saving = ref(false);
const showFullSummary = ref(false);

const entry = computed(() => library.get(props.id));
const guides = computed(() => guidesStore.listFor(props.id));
const status = computed({
  get: () => entry.value?.status ?? 'backlog',
  set: async (value) => {
    saving.value = true;
    try {
      await library.update(props.id, { status: value });
    } finally {
      saving.value = false;
    }
  },
});

// Biblioteca (cache) + catálogo + guias do jogo em paralelo
onMounted(async () => {
  try {
    const [g] = await Promise.all([library.getGame(props.id), library.load(), guidesStore.loadList(props.id)]);
    game.value = g ?? entry.value;
  } finally {
    loading.value = false;
  }
});

async function removeGame() {
  if (!confirm('Remover este jogo da biblioteca? Os guias continuam salvos.')) return;
  await library.remove(props.id);
  router.replace({ name: 'library' });
}
</script>

<template>
  <div class="container page">
    <LoadingState v-if="loading" />

    <EmptyState v-else-if="!game" title="Jogo não encontrado" text="Ele pode ter sido removido da biblioteca.">
      <BaseButton to="/">Voltar à biblioteca</BaseButton>
    </EmptyState>

    <template v-else>
      <BackButton to="/" class="mb-2" />

      <section class="hero d-flex gap-3 mb-4">
        <GameCover :cover-id="game.coverId" :title="game.title" eager class="hero__cover shrink-0 radius-2" />
        <div class="d-flex flex-column gap-2 min-w-0 flex-1">
          <div>
            <h1>{{ game.title }}</h1>
            <p class="text-muted mt-1">
              {{ [game.year, ...(game.platforms ?? []).slice(0, 4)].filter(Boolean).join(' · ') }}
            </p>
          </div>

          <div v-if="game.genres?.length" class="d-flex flex-wrap gap-1">
            <span v-for="genre in game.genres" :key="genre" class="tag">{{ genre }}</span>
          </div>

          <StatusPicker v-if="entry" v-model="status" :disabled="saving" />

          <div class="d-flex flex-wrap gap-1">
            <BaseButton v-if="game.igdbUrl" :icon="ExternalLink" size="sm" variant="ghost" :href="game.igdbUrl">IGDB</BaseButton>
            <BaseButton v-if="entry" :icon="Trash2" size="sm" variant="danger" @click="removeGame">Remover</BaseButton>
          </div>
        </div>
      </section>

      <section v-if="game.summary" class="mb-4">
        <p class="summary text-muted" :class="{ 'line-clamp-3': !showFullSummary }">{{ game.summary }}</p>
        <button type="button" class="text-sm text-accent fw-500 mt-1" @click="showFullSummary = !showFullSummary">
          {{ showFullSummary ? 'Mostrar menos' : 'Ler mais' }}
        </button>
      </section>

      <section>
        <div class="d-flex align-center justify-between gap-2 mb-2">
          <h2>Guias</h2>
          <BaseButton :to="{ name: 'guide-new', params: { gameId: id } }" :icon="Plus" size="sm">Novo guia</BaseButton>
        </div>

        <div v-if="guides.length" class="d-flex flex-column gap-2">
          <GuideCard v-for="g in guides" :key="g.id" :guide="g" :show-game="false" />
        </div>
        <EmptyState v-else :icon="BookOpen" title="Nenhum guia ainda" text="Crie o roteiro de troféus deste jogo." />
      </section>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.hero {
  flex-direction: column;

  @include up(sm) {
    flex-direction: row;
  }

  &__cover {
    width: 160px;
    box-shadow: var(--shadow);

    @include up(md) {
      width: 200px;
    }
  }
}

.summary {
  max-width: 720px;
}
</style>
