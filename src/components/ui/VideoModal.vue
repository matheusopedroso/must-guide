<script setup>
import { computed } from 'vue';
import { ExternalLink } from 'lucide-vue-next';
import BaseModal from './BaseModal.vue';
import { parseYoutube, youtubeEmbedUrl } from '@/utils/url';

// Player do YouTube dentro do app. O iframe só existe com a janela aberta (não carrega nada antes).
const open = defineModel({ type: Boolean, default: false });
const props = defineProps({
  url: { type: String, required: true },
  title: { type: String, default: 'Vídeo' },
});

const video = computed(() => parseYoutube(props.url));
const src = computed(() => (video.value ? youtubeEmbedUrl(video.value) : ''));
</script>

<template>
  <BaseModal v-model="open" :title="title" wide>
    <div v-if="open && src" class="player radius-1">
      <iframe
        :src="src"
        :title="title"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      />
    </div>
    <a :href="url" target="_blank" rel="noopener noreferrer" class="open-link d-inline-flex align-center gap-1 text-sm mt-2">
      <ExternalLink :size="14" /> Abrir no YouTube
    </a>
  </BaseModal>
</template>

<style lang="scss" scoped>
.player {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #000;

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
}

.open-link {
  color: var(--text-muted);

  &:hover {
    color: var(--accent);
  }
}
</style>
