<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronDown, Link2, Link2Off, Plus, RefreshCw, SearchX, Sparkles } from 'lucide-vue-next';
import EmptyState from '@/components/ui/EmptyState.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import TrophyCounts from '@/components/trophies/TrophyCounts.vue';
import PsnTitlePicker from '@/components/trophies/PsnTitlePicker.vue';
import SectionTrophyGrid from '@/components/sections/SectionTrophyGrid.vue';
import { useAsyncState } from '@/composables/useAsyncState';
import { useAuth } from '@/composables/useAuth';
import { useLibrary } from '@/composables/useLibrary';
import { fetchTrophyProgress, findTrophyLists } from '@/services/trophies.service';
import { loadTrophyList } from '@/services/trophyListSource';
import { isSameGame } from '@/utils/text';

// Aba Troféus da página do jogo, mesmo sem guia:
// - Sincronizado (jogo ↔ lista da PSN guardado na biblioteca, sem precisar de guia): a lista com o SEU progresso
//   (conquistados em verde, % e quantos faltam); trocar a lista ou desvincular.
// - Ainda não: busca automática da lista pelo nome (sua conta primeiro + perfis públicos de referência — API /find).
//   Só o MESMO jogo é sugerido; "Sincronizar com a PSN" guarda o vínculo, "Criar guia com esta lista" leva ao editor.
//   Não achou ou é outra? "Escolher a lista" abre a busca completa (sua conta, outro perfil, código NPWR).
// Só para quem edita (a PSN do servidor é rota privada).
const props = defineProps({
  game: { type: Object, required: true },
  hasGuide: Boolean,
});

const { enabled, isAdmin } = useAuth();
const canEdit = computed(() => !enabled || isAdmin.value);
const router = useRouter();
const { linkOf, setLink } = useLibrary();
const link = computed(() => linkOf(props.game.id));

// Busca automática só sem vínculo
const query = computed(() => (canEdit.value && !link.value && props.game.title) || null);
const { data: results, loading, error } = useAsyncState(query, (title, opts) => findTrophyLists(title, '', opts));
// Só o MESMO jogo (nome igual, tirando sufixos de edição como "Remastered"/"PS5"): parecido não serve aqui.
// A da sua conta vem primeiro (você tem o jogo).
const mine = (r) => r.sources?.includes('Sua conta');
const versions = computed(() =>
  (results.value ?? [])
    .filter((r) => isSameGame(r.name, props.game.title))
    .sort((a, b) => mine(b) - mine(a))
    .slice(0, 4),
);
// Chip da versão: plataforma; nome diferente (edição) ou mesma plataforma repetida (região) ganha o detalhe
const chipLabel = (v) => {
  const samePlatform = versions.value.filter((x) => x.platform === v.platform).length > 1;
  const named = v.name !== versions.value[0].name;
  return [v.platform, named ? v.name : '', samePlatform && !named ? v.id : ''].filter(Boolean).join(' · ');
};

const selectedId = ref(null);
watch(
  versions,
  (v) => (selectedId.value = v.find(mine)?.id ?? v.find((x) => x.platform.includes('PS5'))?.id ?? v[0]?.id ?? null),
  { immediate: true },
);
// Lista aberta: a sincronizada ou a escolhida entre as sugestões
const selected = computed(() => link.value ?? versions.value.find((v) => v.id === selectedId.value) ?? null);

const { data: list, loading: listLoading } = useAsyncState(selected, (v, opts) =>
  loadTrophyList(v.id, v.service, { ...opts, prefer: 'saved', canSave: enabled && isAdmin.value }),
);
// Seu progresso: só com a lista sincronizada (é a sua conta)
const { data: progress, loading: progressLoading, reload: reloadProgress } = useAsyncState(link, (v, opts) =>
  fetchTrophyProgress(v.id, v.service, opts),
);
const base = computed(() => (list.value?.trophies ?? []).filter((t) => t.groupId === 'default'));
const dlcCount = computed(() => (list.value?.trophies.length ?? 0) - base.value.length);
// Seu progresso no jogo base (o mesmo recorte da grade; as DLCs ficam à parte)
const mineSummary = computed(() => {
  const p = progress.value;
  if (!p?.total || !base.value.length) return null;
  const earned = base.value.filter((t) => p.trophies[t.id]?.earned).length;
  return { earned, total: base.value.length, pct: Math.round((earned / base.value.length) * 100) };
});

const PREVIEW = 12;
const showAll = ref(false);
const shown = computed(() => (showAll.value ? base.value : base.value.slice(0, PREVIEW)));

function sync(title = selected.value) {
  setLink(props.game, title);
  picking.value = false;
  showAll.value = false;
}
const unlink = () => setLink(props.game, null);

// Escolher a lista à mão (sua conta, outro perfil, código)
const picking = ref(false);

// Criar guia já com a lista (o editor vincula sozinho: ?lista=)
function createGuide() {
  const v = selected.value;
  router.push({ name: 'guide-edit', params: { id: props.game.id }, query: { lista: v.id, svc: v.service, nome: v.name, plat: v.platform } });
}
</script>

<template>
  <section v-if="canEdit" id="game-trophies" class="d-flex flex-column gap-2" aria-label="Troféus do jogo">
    <p v-if="loading" class="d-flex align-center gap-1 text-sm text-muted"><Sparkles :size="14" /> Procurando a lista de troféus na PSN…</p>
    <p v-else-if="error" class="text-sm text-muted">Não deu para buscar a lista agora ({{ error }}).</p>

    <EmptyState
      v-else-if="!selected"
      :icon="SearchX"
      title="Lista de troféus não encontrada"
      text="Nenhum acervo tem este jogo com esse nome. Escolha a lista na sua conta, no perfil de quem já jogou ou cole o código (NPWR)."
    >
      <BaseButton :icon="Link2" variant="primary" @click="picking = true">Escolher a lista</BaseButton>
    </EmptyState>

    <template v-else>
      <div v-if="!link && versions.length > 1" class="d-flex flex-wrap gap-1" role="group" aria-label="Versão">
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
          {{ chipLabel(v) }}
        </button>
      </div>

      <div class="gt__head d-flex align-start flex-wrap gap-2 text-sm text-muted">
        <img v-if="selected.icon" :src="selected.icon" alt="" class="gt__icon radius-1" loading="lazy" />
        <span class="d-flex flex-column gap-1 flex-1 min-w-0">
          <span class="d-flex align-center flex-wrap gap-1">
            <strong class="text-body">{{ selected.name }}</strong>
            <span class="tag">{{ selected.platform }}</span>
            <span v-if="link" class="badge badge--success"><Link2 :size="12" /> Sincronizado com a PSN</span>
          </span>
          <TrophyCounts v-if="list?.counts || selected.counts" :counts="list?.counts ?? selected.counts" class="text-xs" />
          <span v-if="!link && selected.sources" class="text-xs text-subtle">Achado em: {{ selected.sources.join(' · ') }}</span>
        </span>

        <!-- Ações -->
        <span v-if="link" class="d-flex flex-wrap gap-1">
          <BaseButton :icon="RefreshCw" size="sm" variant="ghost" :loading="progressLoading" @click="reloadProgress">Atualizar</BaseButton>
          <BaseButton :icon="Link2" size="sm" variant="ghost" @click="picking = true">Trocar lista</BaseButton>
          <BaseButton :icon="Link2Off" size="sm" variant="ghost" @click="unlink">Desvincular</BaseButton>
        </span>
        <span v-else class="d-flex flex-column align-end gap-1">
          <span class="d-flex flex-wrap gap-1">
            <BaseButton :icon="Link2" size="sm" variant="primary" @click="sync()">Sincronizar com a PSN</BaseButton>
            <BaseButton v-if="!hasGuide" :icon="Plus" size="sm" @click="createGuide">Criar guia com esta lista</BaseButton>
          </span>
          <button type="button" class="text-xs text-accent" @click="picking = true">Não é este jogo? Escolher outra lista</button>
        </span>
      </div>

      <!-- Seu progresso (sincronizado) -->
      <div v-if="link && mineSummary" class="d-flex flex-column gap-1">
        <span class="d-flex justify-between text-sm text-muted">
          <span>Você: {{ mineSummary.earned }} de {{ mineSummary.total }} troféus</span>
          <strong :class="{ 'text-earned': mineSummary.pct === 100 }">{{ mineSummary.pct === 100 ? 'Platinado ✓' : `${mineSummary.pct}%` }}</strong>
        </span>
        <ProgressBar :value="mineSummary.earned" :max="mineSummary.total" tone="earned" />
      </div>
      <p v-else-if="link && !progressLoading && progress === null" class="text-sm text-muted">
        Sua conta ainda não tem troféus deste jogo (ou é outra versão). Os conquistados aparecem em verde quando tiver.
      </p>

      <p v-if="listLoading" class="text-sm text-muted">Carregando os troféus…</p>
      <template v-else-if="base.length">
        <SectionTrophyGrid :trophies="shown" :progress="link ? progress : null" />
        <div class="d-flex align-center flex-wrap gap-2">
          <BaseButton v-if="base.length > PREVIEW" :icon="ChevronDown" size="sm" variant="ghost" @click="showAll = !showAll">
            {{ showAll ? 'Mostrar menos' : `Ver todos os ${base.length} troféus` }}
          </BaseButton>
          <span v-if="dlcCount > 0" class="text-xs text-subtle">+ {{ dlcCount }} de DLCs</span>
        </div>
      </template>
    </template>

    <BaseModal v-model="picking" title="Lista de troféus do jogo" wide>
      <PsnTitlePicker v-if="picking" :game-title="game.title" title="Sincronizar com a PSN" @select="sync" />
    </BaseModal>
  </section>
</template>

<style lang="scss" scoped>
.gt__icon {
  width: 48px;
  height: 48px;
  object-fit: cover;
  background: var(--surface-2);
}

.gt__head > :last-child {
  margin-left: auto;
}

.text-body {
  color: var(--text);
}
</style>
