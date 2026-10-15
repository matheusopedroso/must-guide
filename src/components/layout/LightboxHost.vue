<script setup>
import ImageLightbox from '@/components/ui/ImageLightbox.vue';
import { useLightbox } from '@/composables/useLightbox';

// A janela de imagens em tela cheia do app (aberta por useLightbox().open)
const { images, index } = useLightbox();
</script>

<template>
  <ImageLightbox v-model="index" :images="images" />
</template>
