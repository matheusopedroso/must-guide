<script setup>
import BackButton from './BackButton.vue';

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  back: { type: [String, Object], default: null },
});
</script>

<template>
  <header class="d-flex flex-column gap-2 mb-3">
    <BackButton v-if="back" :to="back" />
    <div class="d-flex align-end justify-between flex-wrap gap-2">
      <div class="min-w-0">
        <h1>{{ title }}</h1>
        <p v-if="subtitle" class="text-muted mt-1">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="d-flex align-center gap-1">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

