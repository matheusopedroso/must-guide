<script setup>
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { LoaderCircle } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import { fetchGame } from '@/services/games.service';
import { normalizeUrl } from '@/utils/url';

// Imagem para o texto do guia: escolhe entre as artes e screenshots do jogo (IGDB) ou cola um link (https),
// com legenda opcional. As imagens do jogo vêm dos detalhes (uma consulta, guardada na sessão).
const props = defineProps({ gameId: { type: String, default: '' } });
const emit = defineEmits(['insert', 'cancel']);

const url = ref('');
const caption = ref('');
const images = ref([]);
const loading = ref(false);
const urlInput = useTemplateRef('urlInput');

onMounted(async () => {
  urlInput.value?.focus();
  if (!props.gameId) return;
  loading.value = true;
  try {
    images.value = (await fetchGame(props.gameId)).game?.images ?? [];
  } catch {
    images.value = []; // sem API (ou outro provedor): fica só o link
  } finally {
    loading.value = false;
  }
});

const src = computed(() => {
  const v = normalizeUrl(url.value);
  return v.startsWith('https://') ? v : '';
});
const thumb = (u) => u.replace('/t_screenshot_big/', '/t_screenshot_med/');

function submit() {
  if (src.value) emit('insert', { src: src.value, caption: caption.value.trim() });
}
</script>

<template>
  <form class="img-form surface radius-2 p-2 d-flex flex-column gap-2" @submit.prevent="submit" @keydown.esc.prevent="emit('cancel')">
    <p class="text-sm fw-600">Imagem no texto</p>

    <div v-if="loading" class="d-flex align-center gap-1 text-sm text-muted"><LoaderCircle :size="16" class="spin" /> Buscando imagens do jogo…</div>
    <div v-else-if="images.length" class="d-flex flex-column gap-1">
      <span class="field__label">Imagens do jogo</span>
      <div class="gallery">
        <button
          v-for="img in images"
          :key="img"
          type="button"
          class="gallery__item radius-1"
          :class="{ 'is-active': url === img }"
          :aria-pressed="url === img"
          @click="url = img"
        >
          <img :src="thumb(img)" alt="" loading="lazy" />
        </button>
      </div>
    </div>

    <label class="field">
      <span class="field__label">{{ images.length ? 'Ou cole o link de uma imagem' : 'Link da imagem' }}</span>
      <input ref="urlInput" v-model="url" class="input" placeholder="https://…" inputmode="url" autocomplete="off" />
    </label>
    <label class="field">
      <span class="field__label">Legenda (opcional)</span>
      <input v-model="caption" class="input" placeholder="Ex.: mapa dos coletáveis da região" maxlength="200" />
    </label>

    <img v-if="src" :src="src" alt="" class="preview radius-1" />
    <p v-else-if="url.trim()" class="text-xs text-danger">Use um link https de imagem.</p>

    <div class="d-flex justify-end gap-1">
      <BaseButton size="sm" variant="ghost" @click="emit('cancel')">Cancelar</BaseButton>
      <BaseButton size="sm" variant="primary" type="submit" :disabled="!src">Inserir</BaseButton>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.img-form {
  box-shadow: var(--shadow);
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: space(1);
  max-height: 200px;
  overflow-y: auto;

  &__item {
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border: 2px solid transparent;
    background: var(--surface-2);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &.is-active,
    &:hover {
      border-color: var(--accent);
    }
  }
}

.preview {
  max-height: 160px;
  object-fit: contain;
  background: var(--surface-2);
}

.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
