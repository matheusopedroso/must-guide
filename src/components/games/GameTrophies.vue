<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronDown, Plus, Sparkles, Trophy } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import TrophyCounts from '@/components/trophies/TrophyCounts.vue';
import SectionTrophyGrid from '@/components/sections/SectionTrophyGrid.vue';
import { useAsyncState } from '@/composables/useAsyncState';
import { useAuth } from '@/composables/useAuth';
import { findTrophyLists } from '@/services/trophies.service';
import { loadTrophyList } from '@/services/trophyListSource';

// Troféus do jogo na página do jogo, mesmo sem guia e sem você ter jogado: busca automática da lista pelo nome
// (sua conta + perfis públicos de referência — ver API /find). Versões (PS4/PS5) viram chips; mostra os troféus
// do jogo base (DLCs à parte) e leva ao editor já com a lista vinculada. Só para quem edita (a busca usa a PSN
// do servidor, rota privada).
const props = defineProps({
  game: { type: Object, required: true },
  hasGuide: Boolean,
});

const { enabled, isAdmin } = useAuth();
const canEdit = computed(() => !enabled || isAdmin.value);
const router = useRouter();

const STRONG = 80; // nome igual ou começando igual (evita "Ghost of Tsushima" para "Ghost of Yōtei")
const query = computed(() => (canEdit.value && props.game.title) || null);
const { data: results, loading, error } = useAsyncState(query, (title, opts) => findTrophyLists(title, '', opts));
const versions = computed(() => (results.value ?? []).filter((r) => r.score >= STRONG).slice(0, 4));

const selectedId = ref(null);
watch(versions, (v) => (selectedId.value = v.find((x) => x.platform.includes('PS5'))?.id ?? v[0]?.id ?? null), { immediate: true });
const selected = computed(() => versions.value.find((v) => v.id === selectedId.value) ?? null);

const { data: list, loading: listLoading } = useAsyncState(selected, (v, opts) =>
  loadTrophyList(v.id, v.service, { ...opts, prefer: 'saved', canSave: enabled && isAdmin.value }),
);
const base = computed(() => (list.value?.trophies ?? []).filter((t) => t.groupId === 'default'));
const dlcCount = computed(() => (list.value?.trophies.length ?? 0) - base.value.length);

const PREVIEW = 12;
const showAll = ref(false);
const shown = computed(() => (showAll.value ? base.value : base.value.slice(0, PREVIEW)));

// Criar guia já com a lista (o editor vincula sozinho: ?lista=)
function createGuide() {
  const v = selected.value;
  router.push({ name: 'guide-edit', params: { id: props.game.id }, query: { lista: v.id, svc: v.service, nome: v.name, plat: v.platform } });
}
</script>

<template>
  <section v-if="canEdit && (loading || versions.length || error)" class="d-flex flex-column gap-2" aria-labelledby="game-trophies">
    <div class="d-flex align-center justify-between flex-wrap gap-1">
      <h2 id="game-trophies" class="section-heading d-flex align-center gap-1"><Trophy :size="18" /> Troféus</h2>
      <BaseButton v-if="selected && !hasGuide" :icon="Plus" size="sm" variant="primary" @click="createGuide">Criar guia com esta lista</BaseButton>
    </div>

    <p v-if="loading" class="d-flex align-center gap-1 text-sm text-muted"><Sparkles :size="14" /> Procurando a lista de troféus na PSN…</p>
    <p v-else-if="error" class="text-sm text-muted">Não deu para buscar a lista agora ({{ error }}).</p>

    <template v-else-if="selected">
      <div v-if="versions.length > 1" class="d-flex flex-wrap gap-1" role="group" aria-label="Versão">
        <button
          v-for="v in versions"
          :key="v.id"
          type="button"
          class="chip chip--sm"
          :class="{ 'is-active': v.id === selectedId }"
          :aria-pressed="v.id === selectedId"
          :title="v.name"
          @click="(selectedId = v.id), (showAll = false)"
        >
          {{ v.platform }}<template v-if="v.name !== versions[0].name"> · {{ v.name }}</template>
        </button>
      </div>

      <div class="d-flex align-center flex-wrap gap-2 text-sm text-muted">
        <img v-if="selected.icon" :src="selected.icon" alt="" class="gt__icon radius-1" loading="lazy" />
        <span class="d-flex flex-column gap-1">
          <strong class="text-body">{{ selected.name }} <span class="tag">{{ selected.platform }}</span></strong>
          <TrophyCounts :counts="selected.counts" class="text-xs" />
        </span>
        <span class="text-xs text-subtle ml-auto">Achado em: {{ selected.sources.join(' · ') }}</span>
      </div>

      <p v-if="listLoading" class="text-sm text-muted">Carregando os troféus…</p>
      <template v-else-if="base.length">
        <SectionTrophyGrid :trophies="shown" />
        <div class="d-flex align-center flex-wrap gap-2">
          <BaseButton v-if="base.length > PREVIEW" :icon="ChevronDown" size="sm" variant="ghost" @click="showAll = !showAll">
            {{ showAll ? 'Mostrar menos' : `Ver todos os ${base.length} troféus` }}
          </BaseButton>
          <span v-if="dlcCount > 0" class="text-xs text-subtle">+ {{ dlcCount }} de DLCs</span>
        </div>
      </template>
    </template>
  </section>
</template>

<style lang="scss" scoped>
.gt__icon {
  width: 48px;
  height: 48px;
  object-fit: cover;
  background: var(--surface-2);
}

.text-body {
  color: var(--text);
}
</style>
