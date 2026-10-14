<script setup>
import { computed, nextTick, ref } from 'vue';
import { Plus } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import SectionEditor from '@/components/sections/SectionEditor.vue';
import { useGuideDraft } from '@/composables/guide/useGuideDraft';
import { useSections } from '@/composables/guide/useSections';
import { useTrophyData } from '@/composables/guide/useTrophyData';
import { useTrophyVersions } from '@/composables/guide/useTrophyVersions';
import { provideTrophyContext } from '@/composables/guide/useTrophyContext';
import { useToast } from '@/composables/useToast';
import { sectionHasContent } from '@/utils/sections';

// Aba de texto em seções no editor (Guia, Roadmap — como o roadmap do PSNProfiles): cada seção tem
// título, texto corrido e os troféus ligados a ela. A aba diz onde guardar e os textos (config/guideTabs → sections).
// Usa a lista da versão principal (já em cache da aba Troféus).
const props = defineProps({
  tab: { type: Object, required: true },
  game: { type: Object, default: null }, // a página passa para todas as abas
});

const cfg = computed(() => props.tab.sections);
const unit = computed(() => cfg.value.unit.toLowerCase());
const { draft } = useGuideDraft();
const { sections, add, update, remove, move, addTrophies, removeTrophy, citedMissing, covered } = useSections(draft, props.tab.sections.key);
const { principal } = useTrophyVersions(draft);
const { list } = useTrophyData(principal, { withProgress: false });
const toast = useToast();

const trophies = computed(() => list.value?.trophies ?? []);
const byId = computed(() => new Map(trophies.value.map((t) => [t.id, t])));
provideTrophyContext({ trophies, goTo: () => {} }); // o "@" do editor cita troféus desta lista

const coveredCount = computed(() => trophies.value.filter((t) => covered.value.has(t.id)).length);

async function addSection() {
  const id = add();
  await nextTick();
  document.querySelector(`[data-section="${id}"] input`)?.focus();
}

function addMany(id, ids) {
  const n = addTrophies(id, ids);
  if (ids.length > 1) toast.show(n ? `${n} troféu(s) adicionados.` : `Eles já estavam na ${unit.value}.`, 'success');
}

// Remover: pede confirmação só se a seção tiver conteúdo
const removing = ref(null);
function askRemove(section) {
  if (sectionHasContent(section)) removing.value = section.id;
  else remove(section.id);
}
function confirmRemove() {
  remove(removing.value);
  removing.value = null;
}
</script>

<template>
  <div class="d-flex flex-column gap-2">
    <p v-if="!principal" class="notice text-sm radius-1 p-2">
      Vincule a lista de troféus na aba Troféus para poder citar e escolher os troféus de cada {{ unit }}.
    </p>

    <EmptyState v-if="!sections.length" :icon="tab.icon" :title="tab.label" :text="cfg.emptyText">
      <BaseButton :icon="Plus" variant="primary" @click="addSection">Adicionar {{ unit }}</BaseButton>
    </EmptyState>

    <template v-else>
      <div v-if="trophies.length" class="d-flex flex-column gap-1">
        <p class="text-xs text-muted">{{ coveredCount }} de {{ trophies.length }} troféus em alguma {{ unit }}</p>
        <ProgressBar :value="coveredCount" :max="trophies.length" />
      </div>

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
        @update="update(s.id, $event)"
        @move="move(s.id, $event)"
        @remove="askRemove(s)"
        @add-trophies="addMany(s.id, $event)"
        @remove-trophy="removeTrophy(s.id, $event)"
      />

      <BaseButton :icon="Plus" class="align-self-start" @click="addSection">Adicionar {{ unit }}</BaseButton>
    </template>

    <BaseModal :model-value="!!removing" :title="`Remover ${unit}`" @update:model-value="(v) => !v && (removing = null)">
      <p class="text-muted">O texto e a lista de troféus desta {{ unit }} serão apagados.</p>
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
