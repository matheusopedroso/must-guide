<script setup>
import { computed, ref } from 'vue';
import { Link2, TriangleAlert } from 'lucide-vue-next';
import SearchInput from '@/components/ui/SearchInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import TrophyCounts from './TrophyCounts.vue';
import { useAsyncState } from '@/composables/useAsyncState';
import { fetchPsnTitles } from '@/services/trophies.service';
import { NP_ID_PATTERN } from '@/config/trophies';
import { rankByName } from '@/utils/text';

// Vincula o jogo à lista de troféus da PSN: pelos jogos da conta (melhor correspondência primeiro)
// ou colando o código NPWR (jogos que a conta ainda não tem)
const props = defineProps({ gameTitle: { type: String, default: '' } });
const emit = defineEmits(['select']);

const term = ref(props.gameTitle);
const code = ref('');
const codeError = ref('');

const { data: titles, loading, error, reload } = useAsyncState(ref('me'), (_, opts) => fetchPsnTitles(opts));

const results = computed(() => {
  const list = titles.value ?? [];
  return term.value.trim() ? rankByName(list, term.value, (t) => t.name) : list;
});

function submitCode() {
  const id = code.value.trim().toUpperCase();
  if (!NP_ID_PATTERN.test(id)) return (codeError.value = 'Formato esperado: NPWR12345_00');
  codeError.value = '';
  emit('select', { id, service: null });
}
</script>

<template>
  <div class="d-flex flex-column gap-3">
    <section class="surface radius-2 p-2 d-flex flex-column gap-2">
      <div>
        <h3>Vincular lista de troféus</h3>
        <p class="text-sm text-muted mt-1">Escolha o jogo entre os que têm troféus na sua conta PSN.</p>
      </div>

      <SearchInput v-model="term" placeholder="Filtrar seus jogos" />

      <p v-if="loading" class="text-sm text-muted py-1">Carregando seus jogos da PSN…</p>

      <EmptyState v-else-if="error" :icon="TriangleAlert" title="Não deu para acessar a PSN" :text="error">
        <BaseButton size="sm" @click="reload">Tentar de novo</BaseButton>
      </EmptyState>

      <p v-else-if="!results.length" class="text-sm text-muted py-1">
        Nenhum jogo da sua conta combina com “{{ term }}”. Use o código abaixo.
      </p>

      <ul v-else class="titles">
        <li v-for="t in results" :key="t.id">
          <button type="button" class="title d-flex align-center gap-2 w-100 px-1 py-1 radius-1" @click="emit('select', t)">
            <img v-if="t.icon" :src="t.icon" alt="" loading="lazy" class="title__icon radius-1 shrink-0" />
            <span class="d-flex flex-column gap-1 min-w-0 flex-1">
              <span class="d-flex align-center gap-1 min-w-0">
                <span class="fw-500 truncate">{{ t.name }}</span>
                <span class="tag shrink-0">{{ t.platform }}</span>
              </span>
              <TrophyCounts :counts="t.counts" class="text-xs" />
            </span>
            <span class="text-xs text-subtle shrink-0">{{ t.progress }}%</span>
          </button>
        </li>
      </ul>
    </section>

    <form class="surface radius-2 p-2 d-flex flex-column gap-1" @submit.prevent="submitCode">
      <label class="field">
        <span class="field__label">Não está na lista? Cole o código do jogo na PSN</span>
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
.titles {
  max-height: min(480px, 60dvh);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.title {
  text-align: left;
  transition: background 0.15s;

  &:hover {
    background: var(--surface-hover);
  }

  &__icon {
    width: 48px;
    height: 48px;
    object-fit: cover;
    background: var(--surface-2);
  }
}
</style>
