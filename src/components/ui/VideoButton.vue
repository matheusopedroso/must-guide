<script setup>
import { computed, ref } from 'vue';
import { CirclePlay, ExternalLink } from 'lucide-vue-next';
import BaseButton from './BaseButton.vue';
import VideoModal from './VideoModal.vue';
import { normalizeUrl, parseYoutube } from '@/utils/url';

// Botão de vídeo de referência: YouTube toca dentro do app (com o tempo do link); outro site abre em nova aba.
// Atributos extras (size, variant, icon-only, aria-label…) vão para o BaseButton.
defineOptions({ inheritAttrs: false });
const props = defineProps({
  url: { type: String, required: true },
  title: { type: String, default: 'Vídeo' }, // título da janela do player
});

const link = computed(() => normalizeUrl(props.url));
const inApp = computed(() => !!parseYoutube(link.value));
const open = ref(false);
</script>

<template>
  <template v-if="link">
    <BaseButton v-if="inApp" v-bind="$attrs" :icon="CirclePlay" @click="open = true"><slot>Ver vídeo</slot></BaseButton>
    <BaseButton v-else v-bind="$attrs" :icon="ExternalLink" :href="link"><slot>Abrir vídeo</slot></BaseButton>
    <VideoModal v-if="open" v-model="open" :url="link" :title="title" />
  </template>
</template>
