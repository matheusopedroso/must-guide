<script setup>
import { computed } from 'vue';
import { STATUS_MAP } from '@/config/status';

const props = defineProps({ status: { type: String, required: true } });
const info = computed(() => STATUS_MAP[props.status] ?? STATUS_MAP.backlog);
</script>

<template>
  <span class="tag" :style="{ '--dot': info.color }">
    <i class="dot" />
    {{ info.label }}
  </span>
</template>

<style lang="scss" scoped>
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dot);
}
</style>
