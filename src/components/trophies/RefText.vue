<script setup>
import { computed, onMounted, useTemplateRef, watch } from 'vue';
import { hasRichContent, sanitizeHtml, textToHtml } from '@/utils/html';
import { useCollectibleContext } from '@/composables/guide/useCollectibles';

// Leitura de um texto do guia (HTML do editor, sempre filtrado). Chip de troféu → emite `trophy` (id);
// outros links abrem normal; tocar no resto do texto → `text` (ex.: abrir a edição).
// Chip de coletável: a caixinha marca/desmarca (vale para o guia todo); o nome abre os detalhes.
const props = defineProps({ html: { type: String, default: '' } });
const emit = defineEmits(['trophy', 'text']);

const collectibles = useCollectibleContext();
const root = useTemplateRef('root');
const safeHtml = computed(() => (hasRichContent(props.html) ? sanitizeHtml(textToHtml(props.html)) : ''));

// Estado dos chips de coletável (marcado / apagado do guia), direto no DOM do v-html
function paintCollectibles() {
  if (!root.value || !collectibles?.collected) return;
  for (const el of root.value.querySelectorAll('a.collectible-ref')) {
    const id = el.dataset.collectible;
    const done = collectibles.collected.value.has(id);
    el.classList.toggle('is-collected', done);
    el.classList.toggle('is-missing', !collectibles.byId.value.has(id));
    el.setAttribute('aria-pressed', String(done));
  }
}
onMounted(paintCollectibles);
watch([safeHtml, () => collectibles?.collected?.value, () => collectibles?.byId?.value], paintCollectibles, { flush: 'post' });

const BOX_AREA = 28; // px da esquerda do chip que valem como "caixinha"

function onClick(e) {
  const trophyEl = e.target.closest('a.trophy-ref');
  if (trophyEl) {
    e.preventDefault();
    emit('trophy', Number(trophyEl.dataset.trophy));
    return;
  }
  const colEl = e.target.closest('a.collectible-ref');
  if (colEl) {
    e.preventDefault();
    const id = colEl.dataset.collectible;
    if (!collectibles?.byId.value.has(id)) return;
    const first = colEl.getClientRects()[0];
    if (collectibles.toggle && first && e.clientX - first.left <= BOX_AREA) collectibles.toggle(id);
    else collectibles.open?.(id);
    return;
  }
  if (!e.target.closest('a')) emit('text', e);
}
</script>

<template>
  <div v-if="safeHtml" ref="root" class="rich-text" @click="onClick" v-html="safeHtml" />
</template>
