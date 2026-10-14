<script setup>
import { computed, ref } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import GuideStepItem from './GuideStepItem.vue';
import { sectionDone } from '@/utils/guide';

const props = defineProps({
  section: { type: Object, required: true },
  index: { type: Number, required: true },
  done: { type: Object, required: true },
  hideDone: Boolean,
});
defineEmits(['toggle']);

const open = ref(true);
const doneCount = computed(() => sectionDone(props.section, props.done));
const total = computed(() => props.section.steps.length);
const visibleSteps = computed(() =>
  props.hideDone ? props.section.steps.filter((st) => !props.done[st.id]) : props.section.steps,
);
</script>

<template>
  <section class="surface radius-2">
    <button
      type="button"
      class="section-head d-flex align-center gap-2 w-100 px-3 py-2"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="text-sm text-subtle fw-600 shrink-0">{{ String(index + 1).padStart(2, '0') }}</span>
      <h3 class="flex-1 min-w-0 truncate">{{ section.title || 'Sem título' }}</h3>
      <span class="text-sm fw-500 shrink-0" :class="doneCount === total ? 'text-accent' : 'text-muted'">
        {{ doneCount }}/{{ total }}
      </span>
      <ChevronDown :size="18" class="chevron shrink-0" :class="{ 'is-open': open }" />
    </button>

    <ul v-show="open" class="px-3 pb-1 border-top">
      <GuideStepItem
        v-for="step in visibleSteps"
        :key="step.id"
        :step="step"
        :checked="!!done[step.id]"
        @toggle="$emit('toggle', $event)"
      />
      <li v-if="!visibleSteps.length" class="py-2 text-sm text-muted">Tudo feito por aqui.</li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
.section-head {
  min-height: 56px;
  text-align: left;
}

.chevron {
  color: var(--text-subtle);
  transform: rotate(-90deg);
  transition: transform 0.2s $ease;

  &.is-open {
    transform: none;
  }
}
</style>
