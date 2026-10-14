<script setup>
import { computed, ref } from 'vue';
import { TriangleAlert } from 'lucide-vue-next';
import EmptyState from '@/components/ui/EmptyState.vue';
import TrophyHeader from '@/components/trophies/TrophyHeader.vue';
import TrophyList from '@/components/trophies/TrophyList.vue';
import { useTrophyData } from '@/composables/guide/useTrophyData';
import { useTrophyNotes } from '@/composables/guide/useTrophyNotes';
import { useTrophyVersions } from '@/composables/guide/useTrophyVersions';
import { useAuth } from '@/composables/useAuth';

// Troféus do guia em modo leitura: troca de versão (PS4/PS5), busca/filtros e as dicas, sem edição.
// O progresso da conta (conquistados) só aparece para o admin (rota privada).
const props = defineProps({ guide: { type: Object, required: true } });

const guideRef = computed(() => props.guide);
const { getNote, backlinks } = useTrophyNotes(guideRef);
const { versions, active, activeId } = useTrophyVersions(guideRef);
const { enabled, isAdmin } = useAuth();
const withProgress = computed(() => !enabled || isAdmin.value);
const { list, progress, loading, error } = useTrophyData(active, { withProgress });
</script>

<template>
  <EmptyState v-if="!versions.length" title="Sem lista de troféus" text="Este guia ainda não tem a lista de troféus vinculada." />

  <div v-else class="d-flex flex-column gap-2">
    <TrophyHeader
      :versions="versions"
      :active-id="active?.id"
      :list="list"
      :progress="progress"
      :loading="loading"
      readonly
      @select="activeId = $event"
    />

    <EmptyState v-if="error" :icon="TriangleAlert" title="Não deu para carregar os troféus" :text="error" />
    <TrophyList v-else-if="list" :list="list" :progress="progress" :get-note="getNote" :backlinks="backlinks" readonly />
  </div>
</template>
