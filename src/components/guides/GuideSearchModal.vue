<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { BookOpen, Gem, SearchX, Trophy } from 'lucide-vue-next';
import BaseModal from '@/components/ui/BaseModal.vue';
import SearchInput from '@/components/ui/SearchInput.vue';
import { buildSearchIndex, searchGuide } from '@/utils/guideSearch';
import { trophyPageRoute } from '@/utils/trophyRef';

// Busca dentro do guia (leitura): digita e vê, separado por tipo, o texto das seções (todas as abas e páginas),
// os troféus e os coletáveis, com o trecho encontrado em destaque. Tocar leva até lá.
// O índice é montado só quando a busca abre (e refeito se o guia ou a lista mudarem).
const open = defineModel({ type: Boolean, default: false });
const props = defineProps({
  guideId: { type: String, required: true },
  guide: { type: Object, default: null },
  trophies: { type: Array, default: () => [] },
  getNote: { type: Function, required: true },
});
const emit = defineEmits(['open-collectible']);
const router = useRouter();

const term = ref('');
watch(open, (v) => v && (term.value = ''));

const index = computed(() => (open.value && props.guide ? buildSearchIndex(props) : []));
const results = computed(() => searchGuide(index.value, term.value));

const GROUPS = [
  { kind: 'section', label: 'No texto do guia', icon: BookOpen },
  { kind: 'trophy', label: 'Troféus', icon: Trophy },
  { kind: 'collectible', label: 'Coletáveis', icon: Gem },
];
const groups = computed(() =>
  GROUPS.map((g) => ({ ...g, items: results.value.filter((r) => r.kind === g.kind) })).filter((g) => g.items.length),
);

function go(r) {
  open.value = false;
  if (r.kind === 'trophy') return router.push(trophyPageRoute(props.guideId, r.id));
  if (r.kind === 'collectible') return emit('open-collectible', r.id);
  router.push({ name: 'guide-view', params: { id: props.guideId }, ...r.target });
}

// Enter: abre o primeiro resultado
const goFirst = () => results.value[0] && go(results.value[0]);
</script>

<template>
  <BaseModal v-model="open" title="Buscar no guia" wide>
    <div class="d-flex flex-column gap-2">
      <SearchInput
        v-model="term"
        placeholder="Chefe, coletável, troféu, lugar…"
        autofocus
        :input-attrs="{ onKeydown: (e) => e.key === 'Enter' && goFirst() }"
      />

      <p v-if="term.trim().length < 2" class="text-sm text-muted">
        Busca no texto de todas as abas e páginas, nos troféus (nome, descrição e dica) e nos coletáveis.
      </p>
      <div v-else-if="!results.length" class="d-flex align-center gap-1 text-sm text-muted py-2">
        <SearchX :size="16" /> Nada encontrado para “{{ term.trim() }}”.
      </div>

      <section v-for="g in groups" :key="g.kind" class="d-flex flex-column gap-1">
        <p class="kicker d-flex align-center gap-1"><component :is="g.icon" :size="14" /> {{ g.label }} · {{ g.items.length }}</p>
        <button v-for="r in g.items" :key="`${r.kind}-${r.id}`" type="button" class="hit radius-1 p-2 d-flex flex-column gap-1" @click="go(r)">
          <span class="text-xs text-muted">{{ r.where }}</span>
          <span class="fw-600">
            <template v-if="r.titleHit">{{ r.titleHit.before }}<mark>{{ r.titleHit.match }}</mark>{{ r.titleHit.after }}</template>
            <template v-else>{{ r.title }}</template>
          </span>
          <span v-if="r.snippet" class="hit__snippet text-sm text-muted">
            {{ r.snippet.before }}<mark>{{ r.snippet.match }}</mark>{{ r.snippet.after }}
          </span>
        </button>
      </section>
    </div>
  </BaseModal>
</template>

<style lang="scss" scoped>
.hit {
  text-align: left;
  border: 1px solid var(--border);
  background: var(--surface);
  transition: background 0.15s, border-color 0.15s;

  &:hover,
  &:focus-visible {
    border-color: var(--accent);
    background: var(--surface-hover);
  }

  &__snippet {
    line-height: 1.5;
  }
}

mark {
  border-radius: 3px;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
}
</style>
