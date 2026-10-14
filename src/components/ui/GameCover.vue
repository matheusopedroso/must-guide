<script setup>
import { computed, ref, watch } from 'vue';
import { Gamepad2 } from 'lucide-vue-next';
import { coverSrc } from '@/utils/cover';

const props = defineProps({
  src: { type: String, default: null },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md | lg
  eager: Boolean,
});

// 0 = versão redimensionada · 1 = original · 2 = sem imagem
const attempt = ref(0);
watch(() => props.src, () => (attempt.value = 0));

const url = computed(() => {
  if (!props.src || attempt.value > 1) return null;
  return attempt.value === 0 ? coverSrc(props.src, props.size) : props.src;
});

function onError() {
  // Se o redimensionado falhar, tenta o original antes de desistir
  attempt.value = url.value === props.src ? 2 : attempt.value + 1;
}
</script>

<template>
  <div class="cover radius-1">
    <img
      v-if="url"
      :src="url"
      :alt="title"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      @error="onError"
    />
    <div v-else class="cover__empty d-flex align-center justify-center">
      <Gamepad2 :size="24" :stroke-width="1.5" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cover {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: var(--surface-2);

  // Imagens horizontais (RAWG) são cortadas no centro; capas verticais (IGDB) encaixam inteiras
  img,
  &__empty {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  &__empty {
    color: var(--text-subtle);
  }
}
</style>
