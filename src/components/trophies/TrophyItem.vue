<script setup>
import { computed } from 'vue';
import { EyeOff, Trophy } from 'lucide-vue-next';
import { TROPHY_TYPE_MAP } from '@/config/trophies';

const props = defineProps({ trophy: { type: Object, required: true } });
const type = computed(() => TROPHY_TYPE_MAP[props.trophy.type] ?? TROPHY_TYPE_MAP.bronze);
</script>

<template>
  <li class="trophy d-flex gap-2 py-2">
    <div class="trophy__icon radius-1 shrink-0">
      <img v-if="trophy.icon" :src="trophy.icon" alt="" loading="lazy" decoding="async" />
    </div>

    <div class="d-flex flex-column gap-1 min-w-0 flex-1">
      <div class="d-flex align-center flex-wrap gap-1">
        <h4 class="trophy__name">{{ trophy.name || 'Troféu oculto' }}</h4>
        <span class="tag" :style="{ color: type.color }">
          <Trophy :size="14" :stroke-width="2" /> {{ type.label }}
        </span>
        <span v-if="trophy.hidden" class="tag"><EyeOff :size="14" :stroke-width="1.75" /> Oculto</span>
      </div>
      <p v-if="trophy.detail" class="text-sm text-muted">{{ trophy.detail }}</p>
    </div>
  </li>
</template>

<style lang="scss" scoped>
.trophy {
  & + & {
    border-top: 1px solid var(--border);
  }

  &__icon {
    width: 48px;
    height: 48px;
    overflow: hidden;
    background: var(--surface-2);

    @include up(md) {
      width: 56px;
      height: 56px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.3;
  }
}
</style>
