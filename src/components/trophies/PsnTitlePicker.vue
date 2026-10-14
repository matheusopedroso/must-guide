<script setup>
import { computed, ref } from 'vue';
import { Link2, Search, TriangleAlert, UserRound, X } from 'lucide-vue-next';
import SearchInput from '@/components/ui/SearchInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import PsnTitleList from './PsnTitleList.vue';
import { useAsyncState } from '@/composables/useAsyncState';
import { useStoredRef } from '@/composables/useStoredRef';
import { fetchPsnPlayerTitles, fetchPsnTitles } from '@/services/trophies.service';
import { NP_ID_PATTERN } from '@/config/trophies';
import { rankByName } from '@/utils/text';

// Vincula o jogo à lista de troféus da PSN. A PSN só mostra o código (NPWR) de um jogo para quem já jogou, então:
// 1) jogos da sua conta; 2) jogos de outro perfil público (ID da PSN de quem já jogou); 3) colar o código.
// Os perfis usados ficam guardados no navegador para a próxima vez.
const props = defineProps({
  gameTitle: { type: String, default: '' },
  title: { type: String, default: 'Vincular lista de troféus' },
  exclude: { type: Array, default: () => [] }, // ids já ligados ao guia
  cancelable: Boolean,
});
const emit = defineEmits(['select', 'cancel']);

const SOURCES = [
  { id: 'me', label: 'Minha conta' },
  { id: 'player', label: 'Perfil de outra pessoa' },
];
const MAX_RECENT = 5;

const source = ref('me');
const term = ref(props.gameTitle);
const playerInput = ref('');
const player = ref(''); // perfil buscado
const recent = useStoredRef('mg:psn-players', []);
const code = ref('');
const codeError = ref('');

// Uma consulta por vez: "me" (sua conta) ou "@ID" (outro perfil). O cliente da API guarda as respostas da sessão.
const query = computed(() => (source.value === 'me' ? 'me' : player.value && `@${player.value}`));
const { data, loading, error, reload } = useAsyncState(query, (q, opts) =>
  q === 'me' ? fetchPsnTitles(opts).then((titles) => ({ titles })) : fetchPsnPlayerTitles(q.slice(1), opts),
);

const results = computed(() => {
  const list = (data.value?.titles ?? []).filter((t) => !props.exclude.includes(t.id));
  return term.value.trim() ? rankByName(list, term.value, (t) => t.name) : list;
});

function searchPlayer(id = playerInput.value) {
  const value = id.trim();
  if (!value) return;
  playerInput.value = value;
  player.value = value;
  source.value = 'player';
}

// Perfil achado entra no topo dos recentes (com o nome do jeito que está na PSN)
function remember(onlineId) {
  recent.value = [onlineId, ...recent.value.filter((r) => r.toLowerCase() !== onlineId.toLowerCase())].slice(0, MAX_RECENT);
}

function forget(onlineId) {
  recent.value = recent.value.filter((r) => r !== onlineId);
}

function select(t) {
  if (source.value === 'player' && data.value?.player) remember(data.value.player.onlineId);
  emit('select', t);
}

function submitCode() {
  const id = code.value.trim().toUpperCase();
  if (!NP_ID_PATTERN.test(id)) return (codeError.value = 'Formato esperado: NPWR12345_00');
  if (props.exclude.includes(id)) return (codeError.value = 'Essa lista já está no guia.');
  codeError.value = '';
  emit('select', { id, service: null });
}
</script>

<template>
  <div class="d-flex flex-column gap-3">
    <section class="surface radius-2 p-2 d-flex flex-column gap-2">
      <div class="d-flex align-start justify-between gap-2">
        <div>
          <h3>{{ title }}</h3>
          <p class="text-sm text-muted mt-1">
            A PSN só mostra a lista de troféus de jogos que alguém já abriu. Procure na sua conta ou na de quem já jogou.
          </p>
        </div>
        <BaseButton v-if="cancelable" size="sm" variant="ghost" class="shrink-0" @click="emit('cancel')">Cancelar</BaseButton>
      </div>

      <div class="d-flex flex-wrap gap-1" role="tablist" aria-label="Onde procurar">
        <button
          v-for="s in SOURCES"
          :key="s.id"
          type="button"
          role="tab"
          class="chip"
          :class="{ 'is-active': source === s.id }"
          :aria-selected="source === s.id"
          @click="source = s.id"
        >
          {{ s.label }}
        </button>
      </div>

      <!-- Outro perfil: ID da PSN + recentes -->
      <template v-if="source === 'player'">
        <form class="d-flex gap-1" @submit.prevent="searchPlayer()">
          <input
            v-model="playerInput"
            class="input flex-1"
            placeholder="ID da PSN de quem já jogou"
            autocomplete="off"
            spellcheck="false"
            maxlength="16"
          />
          <BaseButton type="submit" :icon="Search" :disabled="!playerInput.trim()">Buscar</BaseButton>
        </form>
        <div v-if="recent.length" class="d-flex flex-wrap align-center gap-1">
          <span class="text-xs text-subtle">Recentes:</span>
          <span v-for="r in recent" :key="r" class="chip chip--sm" :class="{ 'is-active': player === r }">
            <button type="button" class="d-flex align-center gap-1" @click="searchPlayer(r)"><UserRound :size="14" /> {{ r }}</button>
            <button type="button" class="d-flex" :aria-label="`Tirar ${r} dos recentes`" @click="forget(r)"><X :size="14" /></button>
          </span>
        </div>
        <p v-if="!player" class="text-sm text-muted">
          Use o ID de um amigo ou de qualquer jogador com troféus públicos. No PSNProfiles, a página do jogo mostra
          quem já jogou — qualquer nome da lista serve.
        </p>
      </template>

      <template v-if="query">
        <div v-if="data?.player" class="d-flex align-center gap-1 text-sm">
          <img v-if="data.player.avatar" :src="data.player.avatar" alt="" class="avatar radius-full" />
          <span class="text-muted">Jogos de <strong class="player-name">{{ data.player.onlineId }}</strong></span>
        </div>

        <SearchInput v-model="term" :placeholder="source === 'me' ? 'Filtrar seus jogos' : 'Filtrar os jogos dessa pessoa'" />

        <p v-if="loading" class="text-sm text-muted py-1">
          {{ source === 'me' ? 'Carregando seus jogos da PSN…' : `Carregando os jogos de ${player}…` }}
        </p>

        <EmptyState v-else-if="error" :icon="TriangleAlert" :title="source === 'me' ? 'Não deu para acessar a PSN' : 'Não deu para ver esse perfil'" :text="error">
          <BaseButton v-if="source === 'me'" size="sm" @click="reload">Tentar de novo</BaseButton>
        </EmptyState>

        <div v-else-if="!results.length" class="d-flex flex-column align-start gap-1 py-1">
          <p class="text-sm text-muted">
            Nenhum jogo {{ source === 'me' ? 'da sua conta' : `de ${data?.player?.onlineId ?? player}` }} combina com “{{ term }}”.
          </p>
          <BaseButton v-if="source === 'me'" size="sm" variant="ghost" :icon="UserRound" @click="source = 'player'">
            Procurar no perfil de quem já jogou
          </BaseButton>
        </div>

        <PsnTitleList v-else :titles="results" @select="select" />
      </template>
    </section>

    <form class="surface radius-2 p-2 d-flex flex-column gap-1" @submit.prevent="submitCode">
      <label class="field">
        <span class="field__label">Já tem o código da lista? (NPWR…)</span>
        <span class="d-flex gap-1">
          <input v-model="code" class="input flex-1" placeholder="NPWR12345_00" autocomplete="off" spellcheck="false" />
          <BaseButton type="submit" :icon="Link2">Vincular</BaseButton>
        </span>
      </label>
      <p v-if="codeError" class="text-sm text-danger">{{ codeError }}</p>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.avatar {
  width: 24px;
  height: 24px;
  object-fit: cover;
}

.player-name {
  color: var(--text);
}
</style>
