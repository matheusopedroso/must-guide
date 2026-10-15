<script setup>
import { computed, onMounted, useTemplateRef, watch } from 'vue';
import { hasRichContent, sanitizeHtml, textToHtml } from '@/utils/html';
import { useCollectibleContext } from '@/composables/guide/useCollectibles';
import { useTrophyContext } from '@/composables/guide/useTrophyContext';
import { fillTrophyCard, promoteLoneTrophyRefs } from '@/utils/trophyRef';
import { fullImageSrc } from '@/utils/textBlocks';

// Leitura de um texto do guia (HTML do editor, sempre filtrado). Chip de troféu → emite `trophy` (id);
// outros links abrem normal; tocar no resto do texto → `text` (ex.: abrir a edição).
// Chip de coletável: a caixinha marca/desmarca (vale para o guia todo); o nome abre os detalhes.
// Spoiler: trecho borrado até tocar.
// Cartão do troféu (bloco no texto): vira o cartão completo com os dados da lista (contexto de troféus:
// trophies e, se tiver, progress) e tocar nele também emite `trophy`.
const props = defineProps({ html: { type: String, default: '' } });
const emit = defineEmits(['trophy', 'text']);

const collectibles = useCollectibleContext();
const trophyCtx = useTrophyContext();
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

// Cartões dos troféus: monta com os dados da lista (sem a lista, fica o nome guardado no texto).
// Troféu citado sozinho numa linha também vira cartão (o mesmo da grade "Troféus desta seção").
function paintTrophyCards() {
  if (root.value && trophyCtx) promoteLoneTrophyRefs(root.value);
  const cards = root.value?.querySelectorAll('[data-trophy-card]');
  if (!cards?.length || !trophyCtx) return;
  const byId = new Map((trophyCtx.trophies.value ?? []).map((t) => [t.id, t]));
  const stats = trophyCtx.progress?.value?.trophies ?? {};
  for (const el of cards) {
    const id = Number(el.dataset.trophyCard);
    if (byId.has(id)) fillTrophyCard(el, byId.get(id), stats[id]);
  }
}
onMounted(paintTrophyCards);
watch([safeHtml, () => trophyCtx?.trophies.value, () => trophyCtx?.progress?.value], paintTrophyCards, { flush: 'post' });

const BOX_AREA = 28; // px da esquerda do chip que valem como "caixinha"

function onClick(e) {
  // Spoiler fechado: o 1º toque só revela (não abre troféu/link que estiver dentro)
  const spoiler = e.target.closest('.spoiler:not(.is-revealed)');
  if (spoiler) {
    e.preventDefault();
    spoiler.classList.add('is-revealed');
    return;
  }
  // Imagem: abre a versão grande em outra aba
  const img = e.target.closest('figure.guide-img img');
  if (img) {
    window.open(fullImageSrc(img.src), '_blank', 'noopener');
    return;
  }
  const trophyEl = e.target.closest('a.trophy-ref, [data-trophy-card]');
  if (trophyEl) {
    e.preventDefault();
    emit('trophy', Number(trophyEl.dataset.trophy ?? trophyEl.dataset.trophyCard));
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
  <div
    v-if="safeHtml"
    ref="root"
    class="rich-text"
    @click="onClick"
    @keydown.enter="$event.target.matches?.('[data-trophy-card]') && onClick($event)"
    v-html="safeHtml"
  />
</template>
