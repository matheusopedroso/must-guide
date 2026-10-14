<script setup>
import { computed, nextTick, ref } from 'vue';
import { Milestone, Plus } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import RoadmapStageEditor from '@/components/roadmap/RoadmapStageEditor.vue';
import { useGuideDraft } from '@/composables/guide/useGuideDraft';
import { useRoadmap } from '@/composables/guide/useRoadmap';
import { useTrophyData } from '@/composables/guide/useTrophyData';
import { useTrophyVersions } from '@/composables/guide/useTrophyVersions';
import { provideTrophyContext } from '@/composables/guide/useTrophyContext';
import { useToast } from '@/composables/useToast';
import { stageHasContent } from '@/utils/roadmap';

// Aba Roadmap no editor: etapas da platina em texto corrido (como o roadmap do PSNProfiles),
// cada uma com os troféus que saem nela. Usa a lista da versão principal (já em cache da aba Troféus).
defineProps({ game: { type: Object, default: null } }); // a página passa para todas as abas

const { draft } = useGuideDraft();
const { stages, add, update, remove, move, addTrophies, removeTrophy, citedMissing, covered } = useRoadmap(draft);
const { principal } = useTrophyVersions(draft);
const { list } = useTrophyData(principal, { withProgress: false });
const toast = useToast();

const trophies = computed(() => list.value?.trophies ?? []);
const byId = computed(() => new Map(trophies.value.map((t) => [t.id, t])));
provideTrophyContext({ trophies, goTo: () => {} }); // o "@" do editor cita troféus desta lista

const coveredCount = computed(() => trophies.value.filter((t) => covered.value.has(t.id)).length);

async function addStage() {
  const id = add();
  await nextTick();
  document.querySelector(`[data-stage="${id}"] input`)?.focus();
}

function addMany(id, ids) {
  const n = addTrophies(id, ids);
  if (ids.length > 1) toast.show(n ? `${n} troféu(s) adicionados à etapa.` : 'Eles já estavam na etapa.', 'success');
}

// Remover: pede confirmação só se a etapa tiver conteúdo
const removing = ref(null);
function askRemove(stage) {
  if (stageHasContent(stage)) removing.value = stage.id;
  else remove(stage.id);
}
function confirmRemove() {
  remove(removing.value);
  removing.value = null;
}
</script>

<template>
  <div class="d-flex flex-column gap-2">
    <p v-if="!principal" class="notice text-sm radius-1 p-2">
      Vincule a lista de troféus na aba Troféus para poder citar e escolher os troféus de cada etapa.
    </p>

    <EmptyState
      v-if="!stages.length"
      :icon="Milestone"
      title="Roadmap da platina"
      text="Divida a platina em etapas (ex.: jogada da história, limpeza, troféus diversos). Cada etapa tem um texto e os troféus que saem nela."
    >
      <BaseButton :icon="Plus" variant="primary" @click="addStage">Adicionar etapa</BaseButton>
    </EmptyState>

    <template v-else>
      <div v-if="trophies.length" class="d-flex flex-column gap-1">
        <p class="text-xs text-muted">{{ coveredCount }} de {{ trophies.length }} troféus em alguma etapa</p>
        <ProgressBar :value="coveredCount" :max="trophies.length" />
      </div>

      <RoadmapStageEditor
        v-for="(s, i) in stages"
        :key="s.id"
        :data-stage="s.id"
        :stage="s"
        :index="i"
        :total="stages.length"
        :trophies="trophies"
        :by-id="byId"
        :cited="citedMissing(s)"
        @update="update(s.id, $event)"
        @move="move(s.id, $event)"
        @remove="askRemove(s)"
        @add-trophies="addMany(s.id, $event)"
        @remove-trophy="removeTrophy(s.id, $event)"
      />

      <BaseButton :icon="Plus" class="align-self-start" @click="addStage">Adicionar etapa</BaseButton>
    </template>

    <BaseModal :model-value="!!removing" title="Remover etapa" @update:model-value="(v) => !v && (removing = null)">
      <p class="text-muted">O texto e a lista de troféus desta etapa serão apagados.</p>
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
