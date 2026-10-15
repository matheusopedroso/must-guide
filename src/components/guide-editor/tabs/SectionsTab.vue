<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Plus } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import SectionEditor from '@/components/sections/SectionEditor.vue';
import PageNavEditor from '@/components/sections/PageNavEditor.vue';
import CollectibleTypesEditor from '@/components/collectibles/CollectibleTypesEditor.vue';
import { useGuideDraft } from '@/composables/guide/useGuideDraft';
import { useSections } from '@/composables/guide/useSections';
import { usePages } from '@/composables/guide/usePages';
import { useTrophyData } from '@/composables/guide/useTrophyData';
import { useTrophyVersions } from '@/composables/guide/useTrophyVersions';
import { provideTrophyContext } from '@/composables/guide/useTrophyContext';
import { useToast } from '@/composables/useToast';
import { sectionHasContent, sectionLabel, sectionWords } from '@/utils/sections';
import { pageHasContent, pageLabel } from '@/utils/pages';
import { TROPHY_FLAGS } from '@/config/trophies';

// Aba de texto em seções no editor (Guia, Roadmap — como o roadmap do PSNProfiles): cada seção tem
// título, texto corrido e os troféus ligados a ela. A aba diz onde guardar e os textos (config/guideTabs → sections).
// Usa a lista da versão principal (já em cache da aba Troféus).
// Aba paginada (cfg.paged — Guia): em cima as páginas (PageNavEditor); embaixo, as seções da página aberta.
const props = defineProps({
  tab: { type: Object, required: true },
  game: { type: Object, default: null }, // a página passa para todas as abas
});

const cfg = computed(() => props.tab.sections);
const w = computed(() => sectionWords(cfg.value));
const { draft } = useGuideDraft();
const paged = !!props.tab.sections.paged;
const pg = paged ? usePages(draft, props.tab.sections.key) : null;
// Dono da lista de seções: a página aberta (paginada) ou o próprio rascunho
const owner = paged ? pg.current : draft;
const { sections, add, update, remove, move, addTrophies, removeTrophy, citedMissing, covered: pageCovered, addItems, updateItem, removeItem, moveItem, moveItemTo } =
  useSections(owner, paged ? 'sections' : props.tab.sections.key);
// Troféus já em alguma seção: na aba paginada, em qualquer página
const covered = paged ? computed(() => new Set(pg.allSections.value.flatMap((s) => s.trophies))) : pageCovered;
const pageLabels = computed(() => (paged ? pg.pages.value.map(pageLabel) : []));

// Coletáveis: tipos já usados viram sugestão no campo "Tipo"
const types = computed(() => [...new Set(sections.value.flatMap((s) => (s.items ?? []).map((i) => i.type).filter(Boolean)))]);
// Regiões para "Mover para…" (coletáveis)
const regions = computed(() => (cfg.value.items ? sections.value.map((s, i) => ({ id: s.id, label: sectionLabel(s, i, cfg.value) })) : []));
function addCollectibles(id, list) {
  const n = addItems(id, list);
  if (n > 1) toast.show(`${n} coletáveis adicionados.`, 'success');
}
function moveCollectible(fromId, itemId, toId) {
  moveItemTo(fromId, itemId, toId);
  toast.show(`Coletável movido para ${regions.value.find((r) => r.id === toId)?.label ?? 'outra região'}.`, 'success');
}
const { principal } = useTrophyVersions(draft);
const { list } = useTrophyData(principal, { withProgress: false, scope: draft }); // só os troféus deste guia (jogo base ou DLC)
const toast = useToast();

const trophies = computed(() => list.value?.trophies ?? []);
const byId = computed(() => new Map(trophies.value.map((t) => [t.id, t])));
provideTrophyContext({ trophies, goTo: () => {} }); // o "@" do editor cita troféus desta lista

// Abas com marcação (Perdíveis, Online): quantos troféus marcados aparecem sozinhos no topo da leitura
const flag = computed(() => TROPHY_FLAGS.find((f) => f.id === cfg.value.flag) ?? null);
const flaggedCount = computed(() =>
  flag.value ? Object.values(draft.value?.trophies ?? {}).filter((n) => n[flag.value.id]).length : 0,
);

const coveredCount = computed(() => trophies.value.filter((t) => covered.value.has(t.id)).length);

// Vindo do lápis da leitura (#secao-…): rola até a seção e pisca a borda. Espera o rascunho carregar
// (a seção pode ainda não existir) e faz uma vez só.
const route = useRoute();
let jumped = false;
watch(
  [() => route.hash, sections],
  async ([hash, list]) => {
    const id = hash.startsWith('#secao-') ? hash.slice(7) : '';
    if (jumped || !id || !list.some((s) => s.id === id)) return;
    jumped = true;
    await nextTick();
    const el = document.querySelector(`[data-section="${id}"]`);
    if (!el) return;
    el.scrollIntoView({ block: 'start' });
    el.classList.add('is-flash');
    setTimeout(() => el.classList.remove('is-flash'), 1600);
  },
  { immediate: true },
);

async function addSection() {
  const id = add();
  await nextTick();
  document.querySelector(`[data-section="${id}"] input`)?.focus();
}

function addMany(id, ids) {
  const n = addTrophies(id, ids);
  if (ids.length > 1) toast.show(n ? `${n} troféu(s) adicionados.` : `Eles já estavam ${w.value.in} ${w.value.name}.`, 'success');
}

// Remover seção ou página: pede confirmação só se tiver conteúdo
const removing = ref(null); // { kind: 'section', id } | { kind: 'page' }
function askRemove(section) {
  if (sectionHasContent(section)) removing.value = { kind: 'section', id: section.id };
  else remove(section.id);
}
function askRemovePage() {
  if (pageHasContent(pg.current.value)) removing.value = { kind: 'page' };
  else pg.remove();
}
function confirmRemove() {
  if (removing.value.kind === 'page') pg.remove();
  else remove(removing.value.id);
  removing.value = null;
}

function moveToPage(sectionId, i) {
  pg.moveSection(sectionId, i);
  toast.show(`Seção movida para a ${pageLabels.value[i]}.`, 'success');
}
</script>

<template>
  <div class="d-flex flex-column gap-2">
    <p v-if="!principal" class="notice text-sm radius-1 p-2">
      Vincule a lista de troféus na aba Troféus para poder citar e escolher os troféus de cada {{ w.name }}.
    </p>

    <p v-if="flag" class="notice d-flex align-center flex-wrap gap-1 text-sm radius-1 p-2">
      <span class="badge" :class="`badge--${flag.tone}`"><component :is="flag.icon" :size="14" /> {{ flag.label }}</span>
      <span v-if="flaggedCount">
        {{ flaggedCount }} troféu(s) marcado(s) como {{ flag.label }} aparecem sozinhos no topo desta aba na leitura.
      </span>
      <span v-else>Marque os troféus como {{ flag.label }} na aba Troféus (Detalhes) e eles aparecem sozinhos no topo desta aba.</span>
    </p>

    <!-- Coletáveis: cada tipo ligado ao troféu dele -->
    <CollectibleTypesEditor v-if="cfg.items && types.length && draft" v-model="draft.collectibleTypes" :types="types" :trophies="trophies" />

    <!-- Aba paginada sem páginas -->
    <EmptyState v-if="paged && !pg.pages.value.length" :icon="tab.icon" :title="tab.label" :text="cfg.emptyText">
      <BaseButton :icon="Plus" variant="primary" @click="pg.add()">Adicionar página</BaseButton>
    </EmptyState>

    <EmptyState v-else-if="!paged && !sections.length" :icon="tab.icon" :title="tab.label" :text="cfg.emptyText">
      <BaseButton :icon="Plus" variant="primary" @click="addSection">Adicionar {{ w.name }}</BaseButton>
    </EmptyState>

    <template v-else>
      <div v-if="trophies.length" class="d-flex flex-column gap-1">
        <p class="text-xs text-muted">{{ coveredCount }} de {{ trophies.length }} troféus em {{ w.some }} {{ w.name }}</p>
        <ProgressBar :value="coveredCount" :max="trophies.length" />
      </div>

      <PageNavEditor
        v-if="paged"
        :pages="pg.pages.value"
        :index="pg.index.value"
        :placeholder="cfg.pageTitlePlaceholder"
        @select="pg.index.value = $event"
        @add="pg.add()"
        @rename="pg.rename($event)"
        @move="pg.move($event)"
        @remove="askRemovePage"
      />
      <p v-if="paged && !sections.length" class="text-sm text-muted">Página vazia: adicione uma {{ w.name }} para escrever.</p>

      <SectionEditor
        v-for="(s, i) in sections"
        :key="s.id"
        :data-section="s.id"
        :section="s"
        :cfg="cfg"
        :index="i"
        :total="sections.length"
        :trophies="trophies"
        :by-id="byId"
:cited="citedMissing(s)"
        :pages="pageLabels"
        :page-index="paged ? pg.index.value : 0"
        @move-page="moveToPage(s.id, $event)"
        @update="update(s.id, $event)"
        @move="move(s.id, $event)"
        @remove="askRemove(s)"
        @add-trophies="addMany(s.id, $event)"
        @remove-trophy="removeTrophy(s.id, $event)"
        :types="types"
        :regions="regions"
        @add-items="addCollectibles(s.id, $event)"
        @move-item-to="(itemId, toId) => moveCollectible(s.id, itemId, toId)"
        @update-item="(itemId, patch) => updateItem(s.id, itemId, patch)"
        @remove-item="removeItem(s.id, $event)"
        @move-item="(itemId, dir) => moveItem(s.id, itemId, dir)"
      />

      <BaseButton :icon="Plus" class="align-self-start" @click="addSection">Adicionar {{ w.name }}</BaseButton>
    </template>

    <BaseModal
      :model-value="!!removing"
      :title="removing?.kind === 'page' ? 'Remover página' : `Remover ${w.name}`"
      @update:model-value="(v) => !v && (removing = null)"
    >
      <p v-if="removing?.kind === 'page'" class="text-muted">A página e todas as seções dela (textos e troféus) serão apagadas.</p>
      <p v-else class="text-muted">O texto e a lista de troféus {{ w.this }} {{ w.name }} serão apagados.</p>
      <template #footer>
        <span class="flex-1" />
        <BaseButton @click="removing = null">Cancelar</BaseButton>
        <BaseButton variant="danger" @click="confirmRemove">Remover</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style lang="scss" scoped>
.notice {
  background: var(--surface-2);
  color: var(--text-muted);
}

.align-self-start {
  align-self: flex-start;
}
</style>
