<script setup>
import { computed, ref, watch } from 'vue';
import { BookOpen, RefreshCw, Search, Trophy, TriangleAlert } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import SearchInput from '@/components/ui/SearchInput.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import TrophyCounts from '@/components/trophies/TrophyCounts.vue';
import { useAsyncState } from '@/composables/useAsyncState';
import { useStoredRef } from '@/composables/useStoredRef';
import { useMyGuides } from '@/composables/guide/useMyGuides';
import { fetchPsnTitles } from '@/services/trophies.service';
import { PSN_SORTS, PSN_STATUS, allPlatforms, filterPsnGames, isPlatinum, platformsOf, psnStats } from '@/utils/psnGames';
import { TROPHY_TYPE_MAP } from '@/config/trophies';
import { formatDate } from '@/utils/date';

// Biblioteca → aba PSN: todos os jogos da sua conta da PSN (conta do NPSSO, todas as páginas) com as platinas,
// o progresso e os troféus conquistados. Filtros: nome, status (platinado, platina pendente, 100%, em andamento,
// não começado), plataforma; ordem guardada no navegador. Jogo com guia → "Ver guia"; sem → procura o jogo no início.
const { data: titles, loading, error, reload } = useAsyncState(ref('me'), (_, opts) => fetchPsnTitles(opts));
const games = computed(() => titles.value ?? []);

const term = ref('');
const status = ref('');
const platform = ref('');
const sort = useStoredRef('mg:psn-sort', 'recent');

const stats = computed(() => psnStats(games.value));
const platforms = computed(() => allPlatforms(games.value));
const statusCounts = computed(() => Object.fromEntries(PSN_STATUS.map((s) => [s.id, games.value.filter(s.test).length])));
const filtered = computed(() => filterPsnGames(games.value, { status: status.value, platform: platform.value, term: term.value, sort: sort.value }));

// Muitos jogos: mostra aos poucos
const PAGE = 60;
const limit = ref(PAGE);
watch([term, status, platform, sort], () => (limit.value = PAGE));
const shown = computed(() => filtered.value.slice(0, limit.value));

// Lista já vinculada a um guia (jogo base) → "Ver guia"
const { docs } = useMyGuides();
const guideByList = computed(() => {
  const map = new Map();
  for (const [id, g] of docs.value) if (!g.dlc) for (const v of g.versions ?? []) map.set(v.id, id);
  return map;
});

const PLAT = TROPHY_TYPE_MAP.platinum;
</script>

<template>
  <div class="d-flex flex-column gap-3">
    <p v-if="loading" class="text-sm text-muted">Carregando seus jogos da PSN…</p>

    <EmptyState v-else-if="error" :icon="TriangleAlert" title="Não deu para acessar a PSN" :text="error">
      <BaseButton :icon="RefreshCw" size="sm" @click="reload">Tentar de novo</BaseButton>
    </EmptyState>

    <template v-else>
      <!-- Totais -->
      <div class="stats">
        <div class="stat surface radius-2 p-2">
          <span class="kicker">Jogos</span>
          <strong class="stat__value">{{ stats.games }}</strong>
        </div>
        <div class="stat surface radius-2 p-2">
          <span class="kicker">Platinas</span>
          <strong class="stat__value d-flex align-center gap-1" :style="{ color: PLAT.color }"><Trophy :size="20" /> {{ stats.platinum }}</strong>
        </div>
        <div class="stat surface radius-2 p-2">
          <span class="kicker">100%</span>
          <strong class="stat__value">{{ stats.complete }}</strong>
        </div>
        <div class="stat surface radius-2 p-2">
          <span class="kicker">Conclusão média</span>
          <strong class="stat__value">{{ stats.average }}%</strong>
        </div>
        <div class="stat stat--wide surface radius-2 p-2">
          <span class="kicker">Troféus conquistados</span>
          <TrophyCounts :counts="stats.earned" />
        </div>
      </div>

      <!-- Filtros -->
      <div class="d-flex flex-column gap-2">
        <div class="d-flex flex-wrap gap-1 align-center">
          <SearchInput v-model="term" placeholder="Filtrar pelo nome" class="filters__search" />
          <select v-model="sort" class="input filters__sort" aria-label="Ordenar">
            <option v-for="s in PSN_SORTS" :key="s.id" :value="s.id">{{ s.label }}</option>
          </select>
        </div>
        <div class="d-flex flex-wrap gap-1" role="group" aria-label="Status">
          <button
            v-for="s in PSN_STATUS"
            :key="s.id"
            type="button"
            class="chip chip--sm"
            :class="{ 'is-active': status === s.id }"
            :aria-pressed="status === s.id"
            @click="status = s.id"
          >
            {{ s.label }} <span class="chip__count">{{ statusCounts[s.id] }}</span>
          </button>
        </div>
        <div v-if="platforms.length > 1" class="d-flex flex-wrap gap-1" role="group" aria-label="Plataforma">
          <button type="button" class="chip chip--sm" :class="{ 'is-active': !platform }" :aria-pressed="!platform" @click="platform = ''">
            Todas
          </button>
          <button
            v-for="p in platforms"
            :key="p"
            type="button"
            class="chip chip--sm"
            :class="{ 'is-active': platform === p }"
            :aria-pressed="platform === p"
            @click="platform = p"
          >
            {{ p }}
          </button>
        </div>
      </div>

      <p class="text-sm text-muted">{{ filtered.length }} de {{ games.length }} jogos</p>

      <!-- Lista -->
      <ul class="d-flex flex-column gap-1">
        <li v-for="g in shown" :key="g.id" class="row surface radius-2 d-flex flex-column gap-2 p-2" :class="{ 'is-plat': isPlatinum(g) }">
          <!-- Topo: ícone, nome e troféus; ações no canto superior direito (como no troféu do guia) -->
          <div class="d-flex align-start gap-2">
            <img v-if="g.icon" :src="g.icon" alt="" class="row__icon radius-1 shrink-0" loading="lazy" />
            <div v-else class="row__icon radius-1 shrink-0" />

            <div class="d-flex flex-column gap-1 flex-1 min-w-0">
              <span class="d-flex align-center flex-wrap gap-1 min-w-0">
                <strong class="row__name">{{ g.name }}</strong>
                <span v-for="p in platformsOf(g)" :key="p" class="tag">{{ p }}</span>
                <span v-if="isPlatinum(g)" class="badge" :style="{ color: PLAT.color }"><Trophy :size="12" /> Platinado</span>
              </span>
              <span class="d-flex align-center flex-wrap gap-2 text-xs text-muted">
                <TrophyCounts :counts="g.earned ?? {}" />
                <span>de {{ Object.values(g.counts).reduce((a, b) => a + b, 0) }}</span>
                <span v-if="g.lastPlayed">· {{ formatDate(g.lastPlayed) }}</span>
              </span>
            </div>

            <div class="d-flex gap-1 shrink-0">
              <BaseButton
                v-if="guideByList.get(g.id)"
                :to="{ name: 'guide-view', params: { id: guideByList.get(g.id) } }"
                :icon="BookOpen"
                icon-only
                size="sm"
                class="row__action is-filled tooltip-left"
                :aria-label="`Ver guia de ${g.name}`"
                data-tooltip="Ver guia"
              />
              <BaseButton
                :to="{ name: 'home', query: { q: g.name.replace(/[™®]/g, '') } }"
                :icon="Search"
                icon-only
                size="sm"
                class="row__action tooltip-left"
                :aria-label="`Procurar ${g.name}`"
                data-tooltip="Procurar o jogo"
              />
            </div>
          </div>

          <!-- Progresso na largura toda -->
          <div class="d-flex align-center gap-2">
            <ProgressBar :value="g.progress" :max="100" tone="earned" class="flex-1" />
            <span class="row__pct text-xs fw-600 shrink-0">{{ g.progress }}%</span>
          </div>
        </li>
      </ul>
      <p v-if="!filtered.length" class="text-sm text-muted">Nenhum jogo com esses filtros.</p>
      <BaseButton v-if="filtered.length > limit" class="align-self-center" @click="limit += PAGE">
        Mostrar mais ({{ filtered.length - limit }})
      </BaseButton>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: space(1);

  @include up(md) {
    grid-template-columns: repeat(4, minmax(0, 1fr)) minmax(0, 2fr);
  }
}

.stat {
  display: flex;
  flex-direction: column;
  gap: space(1);

  &--wide {
    grid-column: 1 / -1;

    @include up(md) {
      grid-column: auto;
    }
  }

  &__value {
    font-size: 24px;
    line-height: 1;
  }
}

.filters__search {
  flex: 1 1 240px;
}

.filters__sort {
  flex: 0 0 200px;
  width: auto;
}

.row {
  border: 1px solid transparent;

  &.is-plat {
    border-color: color-mix(in srgb, var(--trophy-platinum) 35%, transparent);
  }

  &__icon {
    width: 56px;
    height: 56px;
    object-fit: cover;
    background: var(--surface-2);
  }

  &__name {
    line-height: 1.3;
  }

  &__action.is-filled {
    color: var(--accent);
  }

  &__pct {
    min-width: 40px;
    text-align: right;
  }
}

.align-self-center {
  align-self: center;
}
</style>
