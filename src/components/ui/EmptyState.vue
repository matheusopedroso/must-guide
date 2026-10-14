<script setup>
defineProps({
  icon: { type: [Object, Function], default: null },
  title: { type: String, required: true },
  text: { type: String, default: '' },
});
</script>

<template>
  <div class="empty d-flex flex-column align-center gap-1 text-center py-6 px-3 radius-2">
    <component :is="icon" v-if="icon" :size="32" :stroke-width="1.5" class="text-subtle mb-1" />
    <h3>{{ title }}</h3>
    <p v-if="text" class="text-muted">{{ text }}</p>
    <div v-if="$slots.default" class="mt-2"><slot /></div>
  </div>
</template>

<style lang="scss" scoped>
.empty {
  border: 1px dashed var(--border-strong);

  p {
    max-width: 360px;
  }
}
</style>
