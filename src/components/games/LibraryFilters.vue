<script setup>
import SearchInput from '@/components/ui/SearchInput.vue';
import { GAME_STATUS } from '@/config/status';

const status = defineModel('status', { type: String, default: 'all' });
const text = defineModel('text', { type: String, default: '' });
defineProps({
  counts: { type: Object, required: true },
  total: { type: Number, default: 0 },
});
</script>

<template>
  <div class="d-flex flex-column gap-2 mb-3">
    <SearchInput v-model="text" placeholder="Filtrar biblioteca" class="filters__search" />

    <div class="scroll-x gap-1">
      <button type="button" class="chip" :class="{ 'is-active': status === 'all' }" @click="status = 'all'">
        Todos <span class="chip__count">{{ total }}</span>
      </button>
      <button
        v-for="s in GAME_STATUS"
        :key="s.id"
        type="button"
        class="chip"
        :class="{ 'is-active': status === s.id }"
        @click="status = s.id"
      >
        {{ s.label }} <span class="chip__count">{{ counts[s.id] }}</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filters__search {
  max-width: 400px;
}
</style>
