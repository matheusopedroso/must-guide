<script setup>
import TrophyCounts from './TrophyCounts.vue';

// Lista de jogos da PSN para escolher (jogos da conta ou de outro perfil): ícone, nome, plataforma,
// troféus e o progresso de quem é a lista (ou, na busca automática, onde a lista foi achada)
defineProps({
  titles: { type: Array, required: true }, // [{ id, name, icon, platform, counts, progress?, sources? }]
});
defineEmits(['select']);
</script>

<template>
  <ul class="titles">
    <li v-for="t in titles" :key="t.id">
      <button type="button" class="title d-flex align-center gap-2 w-100 px-1 py-1 radius-1" @click="$emit('select', t)">
        <img v-if="t.icon" :src="t.icon" alt="" loading="lazy" class="title__icon radius-1 shrink-0" />
        <span class="d-flex flex-column gap-1 min-w-0 flex-1">
          <span class="d-flex align-center gap-1 min-w-0">
            <span class="fw-500 truncate">{{ t.name }}</span>
            <span class="tag shrink-0">{{ t.platform }}</span>
          </span>
          <TrophyCounts :counts="t.counts" class="text-xs" />
          <span v-if="t.sources?.length" class="text-xs text-subtle truncate">Achado em: {{ t.sources.join(' · ') }}</span>
        </span>
        <span v-if="t.progress != null" class="text-xs text-subtle shrink-0">{{ t.progress }}%</span>
      </button>
    </li>
  </ul>
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
