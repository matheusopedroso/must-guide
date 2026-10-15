<script setup>
import { computed } from 'vue';
import { Library, LogIn, Search } from 'lucide-vue-next';
import PageHeader from '@/components/ui/PageHeader.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import GameGrid from '@/components/games/GameGrid.vue';
import GameCard from '@/components/games/GameCard.vue';
import { useLibrary } from '@/composables/useLibrary';
import { useAuth } from '@/composables/useAuth';
import { useQueryParam } from '@/composables/useQueryParam';
import { LIBRARY_STATUSES } from '@/config/library';

// Biblioteca pessoal (/biblioteca): os jogos que você marcou (Jogando, Quero platinar, Platinado), mais
// recentes primeiro. Filtro na URL (?status=). Marcar: botão "Biblioteca" na página do jogo ou do guia.
const { entries, counts } = useLibrary();
const { enabled, user, login, busy } = useAuth();

const status = useQueryParam('status');
const FILTERS = computed(() => [
  { id: '', label: 'Todos', count: entries.value.length },
  ...LIBRARY_STATUSES.map((s) => ({ id: s.id, label: s.label, icon: s.icon, count: counts.value[s.id] })),
]);
const visible = computed(() => (status.value ? entries.value.filter((e) => e.status === status.value) : entries.value));
</script>

<template>
  <div class="container page">
    <PageHeader title="Biblioteca" subtitle="Os jogos que você está jogando, quer platinar ou já platinou." />

    <p v-if="enabled && !user && entries.length" class="notice d-flex align-center flex-wrap gap-1 text-sm radius-1 p-2 mb-2">
      Sua biblioteca está só neste navegador.
      <button type="button" class="text-accent fw-600" :disabled="busy" @click="login">
        <LogIn :size="14" class="inline-icon" /> Entrar para ver no celular e no PC
      </button>
    </p>

    <EmptyState
      v-if="!entries.length"
      :icon="Library"
      title="Sua biblioteca está vazia"
      text="Na página de um jogo (ou de um guia), toque em Biblioteca e escolha Jogando, Quero platinar ou Platinado."
    >
      <BaseButton :to="{ name: 'home' }" :icon="Search" variant="primary">Procurar jogo</BaseButton>
    </EmptyState>

    <template v-else>
      <div class="d-flex flex-wrap gap-1 mb-3" role="group" aria-label="Filtrar por status">
        <button
          v-for="f in FILTERS"
          :key="f.id"
          type="button"
          class="chip"
          :class="{ 'is-active': status === f.id }"
          :aria-pressed="status === f.id"
          @click="status = f.id"
        >
          <component :is="f.icon" v-if="f.icon" :size="14" />
          {{ f.label }} <span class="chip__count">{{ f.count }}</span>
        </button>
      </div>

      <GameGrid v-if="visible.length">
        <GameCard v-for="e in visible" :key="e.game.id" :game="e.game" />
      </GameGrid>
      <p v-else class="text-sm text-muted py-2">Nenhum jogo com este status.</p>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.notice {
  background: var(--surface-2);
  color: var(--text-muted);
}

.inline-icon {
  vertical-align: -2px;
}
</style>
