<script setup>
import { computed, ref } from 'vue';
import { Check, ChevronDown, Pencil, TriangleAlert } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import VideoButton from '@/components/ui/VideoButton.vue';
import RefText from '@/components/trophies/RefText.vue';
import { useLightbox } from '@/composables/useLightbox';
import { collectibleAnchorId, collectibleTag, cleanCredit } from '@/utils/collectibles';
import { normalizeUrl } from '@/utils/url';
import { useEditLinks } from '@/composables/guide/useEditLinks';

// Cartão do coletável na leitura (modelo do IGN + numeração do PowerPyx): "Artefato #4", nome, marcas
// (Perdível, Não conta), Tipo | Local, descrição, imagens, vídeo, crédito e a caixa para marcar.
// Vários pegos no mesmo lugar ("Artefato #1 + Artefato #2"): um cartão só, com o local/imagens do 1º e
// uma caixa para cada. Marcado = verde (mesma cor de troféu conquistado).
// compact: uma linha (caixa, número, nome) que abre ao tocar; a caixa da linha marca/desmarca o grupo todo.
const props = defineProps({
  items: { type: Array, required: true }, // [líder, ...mesmo lugar] — com n/of quando vierem de collectiblesOf
  isDone: { type: Function, default: () => false },
  canToggle: { type: Boolean, default: true },
  compact: Boolean,
});
const emit = defineEmits(['toggle', 'open-trophy']);

const lead = computed(() => props.items[0]); // dono do local, descrição, imagens, vídeo e crédito
const group = computed(() => props.items.length > 1);
const nameOf = (it) => it.name || 'Coletável';
const name = computed(() => props.items.map(nameOf).join(' + '));
const tag = computed(() => collectibleTag(lead.value));
// Coluna do número no compacto: "#4" · grupo: "×3" (números de tipos diferentes juntos confundem)
const numbers = computed(() => (group.value ? `×${props.items.length}` : lead.value.n ? `#${lead.value.n}` : ''));
// Título do grupo como no PowerPyx: "Artefato #1: Military Pamphlet + Artefato #2: Boston Q.Z. Map"
const parts = computed(() => props.items.map((it) => ({ id: it.id, tag: collectibleTag(it), name: nameOf(it) })));
const types = computed(() => [...new Set(props.items.map((it) => it.type).filter(Boolean))].join(' + '));
const missable = computed(() => props.items.some((it) => it.missable));

const credit = computed(() => cleanCredit(lead.value.credit));
const video = computed(() => normalizeUrl(lead.value.video ?? ''));
const images = computed(() => (lead.value.images ?? []).map((u) => normalizeUrl(u)).filter(Boolean));
// Imagem em tela cheia (janela única do app) — passa entre as imagens do cartão
const lightbox = useLightbox();
const view = (i) => lightbox.open(images.value.map((src, n) => ({ src, alt: `${name.value} — imagem ${n + 1} de ${images.value.length}` })), i);
const hasBody = computed(() => !!(types.value || lead.value.location || lead.value.description || images.value.length || video.value || credit.value || group.value));

const doneCount = computed(() => props.items.filter((it) => props.isDone(it.id)).length);
const allDone = computed(() => doneCount.value === props.items.length);
// Caixa da linha compacta: marca os que faltam ou, tudo marcado, desmarca todos
const toggleAll = () => props.items.filter((it) => props.isDone(it.id) === allDone.value).forEach((it) => emit('toggle', it.id));

// Lápis (quem pode editar): abre o editor com a janela deste coletável
const links = useEditLinks();
const editTo = computed(() => links?.collectible(lead.value) ?? null);

const expanded = ref(false);
const open = computed(() => !props.compact || expanded.value);
</script>

<template>
  <article
    :id="collectibleAnchorId(lead.id)"
    class="ccard radius-2"
    :class="{ 'is-collected': allDone, 'is-compact': compact, 'is-open': open }"
  >
    <!-- Âncoras dos que estão juntos (o chip no texto leva até o cartão) -->
    <span v-for="it in items.slice(1)" :id="collectibleAnchorId(it.id)" :key="it.id" class="ccard__anchor" aria-hidden="true" />

    <!-- Compacto: caixa + número + nome; tocar abre os detalhes -->
    <div v-if="compact" class="ccard__row d-flex align-center gap-2 px-2 py-1">
      <button
        v-if="canToggle"
        type="button"
        class="ccard__box d-flex align-center justify-center radius-1 shrink-0"
        :class="{ 'is-partial': doneCount && !allDone }"
        :aria-pressed="allDone"
        :aria-label="allDone ? `Desmarcar ${name}` : `Marcar ${name} como coletado`"
        @click="toggleAll"
      >
        <Check v-if="allDone" :size="16" :stroke-width="3" />
        <span v-else-if="doneCount" class="text-xs fw-700">{{ doneCount }}</span>
      </button>
      <button type="button" class="ccard__summary d-flex align-center gap-2 flex-1 min-w-0" :aria-expanded="expanded" @click="expanded = !expanded">
        <span class="ccard__n text-xs fw-700 shrink-0">{{ numbers }}</span>
        <span class="d-flex flex-column min-w-0">
          <span class="fw-600 truncate">{{ name }}</span>
          <span v-if="types || lead.location" class="text-xs text-muted truncate">{{ [types, lead.location].filter(Boolean).join(' · ') }}</span>
        </span>
        <span class="d-flex align-center gap-1 ml-auto shrink-0">
          <TriangleAlert v-if="missable" :size="16" class="ccard__warn" aria-label="Perdível" />
          <ChevronDown v-if="hasBody" :size="16" class="ccard__chevron" />
        </span>
      </button>
      <BaseButton v-if="editTo" :to="editTo" :icon="Pencil" icon-only size="sm" variant="ghost" class="shrink-0" :aria-label="`Editar ${name}`" />
    </div>

    <header v-else class="ccard__name d-flex align-center gap-1 px-2 py-1" :class="{ 'is-group': group }">
      <template v-if="group">
        <span class="flex-1">
          <template v-for="(p, i) in parts" :key="p.id">
            <template v-if="i"> + </template><span v-if="p.tag" class="ccard__tag">{{ p.tag }}:</span> {{ p.name }}
          </template>
        </span>
      </template>
      <template v-else>
        <span class="ccard__side text-xs fw-700">{{ tag }}</span>
        <span class="flex-1 text-center">{{ name }}</span>
      </template>
      <span class="ccard__side d-flex align-center justify-end gap-1">
        <span v-if="missable" class="badge badge--warning"><TriangleAlert :size="12" /> Perdível</span>
        <span v-if="!group && lead.uncounted" class="badge" data-tooltip="Aparece no jogo, mas não conta para o troféu">Não conta</span>
        <BaseButton
          v-if="editTo"
          :to="editTo"
          :icon="Pencil"
          icon-only
          size="sm"
          variant="ghost"
          class="ccard__edit tooltip-left"
          :aria-label="`Editar ${name}`"
          data-tooltip="Editar coletável"
        />
      </span>
    </header>

    <template v-if="open && (!compact || hasBody)">
      <div v-if="compact && !group && (lead.missable || lead.uncounted)" class="ccard__flags d-flex flex-wrap gap-1 px-2 py-1">
        <span v-if="lead.missable" class="badge badge--warning"><TriangleAlert :size="12" /> Perdível</span>
        <span v-if="lead.uncounted" class="badge">Não conta para o troféu</span>
      </div>

      <div v-if="!compact && (types || lead.location)" class="ccard__meta">
        <p v-if="types"><span class="kicker">Tipo</span> {{ types }}</p>
        <p v-if="lead.location"><span class="kicker">Local</span> {{ lead.location }}</p>
      </div>

      <!-- Como achar: texto do editor (botões do controle, troféus citados…); texto antigo simples vira parágrafo -->
      <RefText v-if="lead.description" :html="lead.description" class="ccard__desc px-2 py-2" @trophy="emit('open-trophy', $event)" />

      <div v-if="images.length" class="ccard__images p-2" :class="{ 'is-single': images.length === 1 }">
        <a v-for="(src, i) in images" :key="i" :href="src" class="radius-1" :aria-label="`Ver imagem ${i + 1} em tela cheia`" @click.prevent="view(i)">
          <img :src="src" :alt="`${name} — imagem ${i + 1}`" loading="lazy" decoding="async" />
        </a>
      </div>

      <div v-if="video || credit" class="ccard__extra d-flex align-center flex-wrap gap-2 px-2 py-1">
        <VideoButton v-if="video" :url="video" :title="name" size="sm" variant="ghost" />
        <span v-if="credit" class="text-xs text-muted ml-auto">
          Crédito:
          <a v-if="credit.url" :href="credit.url" target="_blank" rel="noopener noreferrer" class="ccard__credit fw-600">{{ credit.name }}</a>
          <strong v-else>{{ credit.name }}</strong>
        </span>
      </div>
    </template>

    <!-- Uma caixa por coletável (no compacto, só no grupo aberto: a linha já tem a caixa do grupo) -->
    <div v-if="canToggle && (!compact || (group && open))" class="d-flex flex-column gap-1 m-2">
      <label
        v-for="it in items"
        :key="it.id"
        class="ccard__check d-flex align-center gap-2 p-2 radius-1"
        :class="{ 'is-done': isDone(it.id) }"
      >
        <input type="checkbox" class="sr-only" :checked="isDone(it.id)" @change="emit('toggle', it.id)" />
        <span class="ccard__box d-flex align-center justify-center radius-1 shrink-0"><Check v-if="isDone(it.id)" :size="16" :stroke-width="3" /></span>
        <span class="d-flex flex-column min-w-0">
          <span class="fw-600">{{ nameOf(it) }}</span>
          <span v-if="group && collectibleTag(it)" class="text-xs text-muted">{{ collectibleTag(it) }}</span>
        </span>
        <span class="d-flex align-center gap-1 ml-auto shrink-0">
          <template v-if="group">
            <TriangleAlert v-if="it.missable" :size="14" class="ccard__warn" aria-label="Perdível" />
            <span v-if="it.uncounted" class="text-xs text-subtle">não conta</span>
          </template>
          <span v-if="isDone(it.id)" class="ccard__done text-xs fw-600">Coletado</span>
        </span>
      </label>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.ccard {
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface);
  scroll-margin-top: calc(var(--nav-offset) + var(--pbar-gap) + var(--pbar-height) + 64px);
  transition: border-color 0.2s, box-shadow 0.3s;

  &__name {
    min-height: 40px;
    background: var(--accent-soft);
    color: var(--text);
    font-weight: 700;
    transition: background 0.2s;
  }

  // Laterais do título com a mesma largura: o nome fica centralizado
  &__side {
    flex: 0 1 30%;
    min-width: 0;
    color: var(--text-muted);
  }

  // Grupo: título corrido à esquerda ("Artefato #1: … + Artefato #2: …"), marcas na direita
  &__name.is-group &__side {
    flex: 0 0 auto;
  }

  &__tag {
    color: var(--text-muted);
    font-size: 12px;
  }

  // "Próximo que falta": destaca por um instante
  &.is-flash {
    box-shadow: 0 0 0 2px var(--accent);
  }

  &.is-collected {
    border-color: color-mix(in srgb, var(--earned) 45%, transparent);
  }

  &.is-collected &__name,
  &.is-collected &__row {
    background: color-mix(in srgb, var(--earned) 16%, transparent);
  }

  &__row {
    min-height: 56px;
  }

  &__summary {
    text-align: left;
  }

  &__n {
    min-width: 32px;
    color: var(--text-subtle);
  }

  &__warn {
    color: var(--warning);
  }

  &__chevron {
    color: var(--text-subtle);
    transition: transform 0.2s $ease;
  }

  &.is-open &__chevron {
    transform: rotate(180deg);
  }

  &__flags,
  &__extra {
    border-top: 1px solid var(--border);
  }

  &__credit {
    color: var(--accent);

    &:hover {
      text-decoration: underline;
    }
  }

  &__meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    border-top: 1px solid var(--border);

    p {
      padding: space(1) space(2);
      text-align: center;
      font-weight: 600;

      & + p {
        border-left: 1px solid var(--border);
      }
    }

    .kicker {
      margin-right: $space-half;
      font-size: 10px;
    }
  }

  &__desc {
    border-top: 1px solid var(--border);
    color: var(--text-muted);
    line-height: 1.6;
  }

  &__images {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: space(2);
    border-top: 1px solid var(--border);

    @include down(sm) {
      grid-template-columns: minmax(0, 1fr);
    }

    // Uma imagem só: mesmo tamanho de quando são duas (não estica na largura toda)
    &.is-single {
      @include up(sm) {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      }
    }

    a {
      display: block;
      overflow: hidden;
      aspect-ratio: 16 / 9;
      background: var(--surface-2);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s $ease;
    }

    a:hover img {
      transform: scale(1.03);
    }
  }

  &__check {
    border: 1px solid var(--border);
    background: var(--bg);
    cursor: pointer;

    &:hover {
      border-color: var(--border-strong);
    }

    &:focus-within {
      box-shadow: 0 0 0 2px var(--accent);
    }
  }

  &__box {
    width: 24px;
    height: 24px;
    border: 2px solid var(--border-strong);
    color: #fff;
    transition: background 0.15s, border-color 0.15s;
  }

  &.is-collected &__row &__box,
  &__check.is-done &__box {
    background: var(--earned);
    border-color: var(--earned);
  }

  // Grupo com parte marcada (compacto): mostra quantos
  &__box.is-partial {
    border-color: var(--earned);
    color: var(--earned);
  }

  // Âncora de quem está junto no cartão (o chip no texto rola até aqui)
  &__anchor {
    display: block;
    height: 0;
    scroll-margin-top: calc(var(--nav-offset) + var(--pbar-gap) + var(--pbar-height) + 64px);
  }

  &__done {
    color: var(--earned);
  }
}
</style>
