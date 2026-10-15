<script setup>
import { computed, ref } from 'vue';
import { LibraryBig, LogIn, Plus } from 'lucide-vue-next';
import PageHeader from '@/components/ui/PageHeader.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import GuideCard from '@/components/guides/GuideCard.vue';
import DeleteGuideModal from '@/components/guides/DeleteGuideModal.vue';
import BackupMenu from '@/components/guides/BackupMenu.vue';
import { useMyGuides } from '@/composables/guide/useMyGuides';
import { useAuth } from '@/composables/useAuth';
import { GUIDE_STATUS } from '@/utils/guideDraft';

// Meus guias: rascunhos e publicados (nuvem + este navegador), com filtro por status
const { items, docs, counts, loading, error, drop, reload } = useMyGuides();
const { enabled, user, isAdmin, login, busy } = useAuth();

const filter = ref('all');
const FILTERS = [{ id: 'all', label: 'Todos' }, ...Object.entries(GUIDE_STATUS).map(([id, s]) => ({ id, label: `${s.label}s` }))];
// Apagar: o card pede, o modal (um só) confirma; apagou → sai da lista sem recarregar
const deleting = ref(null);
const deleteOpen = ref(false);
const askDelete = (guide) => {
  deleting.value = guide;
  deleteOpen.value = true;
};

const visible = computed(() => (filter.value === 'all' ? items.value : items.value.filter((g) => g.status === filter.value)));
</script>

<template>
  <div class="container page">
    <PageHeader title="Meus guias" subtitle="Rascunhos e guias publicados.">
      <template #actions>
        <BackupMenu :docs="docs" @imported="reload" />
        <BaseButton :to="{ name: 'guide-new' }" :icon="Plus" variant="primary">Criar guia</BaseButton>
      </template>
    </PageHeader>

    <p v-if="enabled && !user" class="notice d-flex align-center flex-wrap gap-1 text-sm radius-1 p-2 mb-2">
      Mostrando só os guias deste navegador.
      <button type="button" class="text-accent fw-600" :disabled="busy" @click="login">
        <LogIn :size="14" class="inline-icon" /> Entrar para ver os da nuvem
      </button>
    </p>
    <p v-else-if="enabled && user && !isAdmin" class="notice text-sm radius-1 p-2 mb-2">
      Esta conta não tem permissão de administrador: mostrando só os guias deste navegador.
    </p>
    <p v-if="error" class="notice is-error text-sm radius-1 p-2 mb-2">{{ error }}</p>

    <div v-if="loading" class="d-flex flex-column gap-2" aria-busy="true">
      <div v-for="n in 3" :key="n" class="skeleton surface radius-2" />
    </div>

    <EmptyState v-else-if="!items.length" :icon="LibraryBig" title="Nenhum guia ainda" text="Escolha um jogo e comece a montar o guia de troféus.">
      <BaseButton :to="{ name: 'guide-new' }" :icon="Plus" variant="primary">Criar guia</BaseButton>
    </EmptyState>

    <template v-else>
      <div class="d-flex flex-wrap gap-1 mb-2" role="group" aria-label="Filtrar por status">
        <button
          v-for="f in FILTERS"
          :key="f.id"
          type="button"
          class="chip"
          :class="{ 'is-active': filter === f.id }"
          :aria-pressed="filter === f.id"
          @click="filter = f.id"
        >
          {{ f.label }} <span class="chip__count">{{ counts[f.id] }}</span>
        </button>
      </div>

      <div class="d-flex flex-column gap-2">
        <GuideCard v-for="g in visible" :key="g.guideId" :guide="g" @delete="askDelete" />
        <p v-if="!visible.length" class="text-sm text-muted py-2">Nenhum guia neste filtro.</p>
      </div>
    </template>

    <DeleteGuideModal v-model="deleteOpen" :guide="deleting" @deleted="drop" />
  </div>
</template>

<style lang="scss" scoped>
.notice {
  background: var(--surface-2);
  color: var(--text-muted);

  &.is-error {
    color: var(--danger);
  }
}

.inline-icon {
  vertical-align: -2px;
}

.skeleton {
  height: 96px;
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}
</style>
