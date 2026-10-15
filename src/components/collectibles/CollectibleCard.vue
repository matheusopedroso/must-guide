<script setup>
import { computed, ref } from 'vue';
import { Check, ChevronDown, TriangleAlert } from 'lucide-vue-next';
import VideoButton from '@/components/ui/VideoButton.vue';
import { collectibleAnchorId, collectibleTag, cleanCredit } from '@/utils/collectibles';
import { normalizeUrl } from '@/utils/url';

// Cartão do coletável na leitura (modelo do IGN + numeração do PowerPyx): "Artefato #4", nome, marcas
// (Perdível, Não conta), Tipo | Local, descrição, imagens, vídeo, crédito e a caixa para marcar.
// Marcado = verde (mesma cor de troféu conquistado). compact: uma linha (caixa, número, nome) que abre ao tocar.
const props = defineProps({
  item: { type: Object, required: true }, // com n/of quando vier de collectiblesOf
  collected: Boolean,
  canToggle: { type: Boolean, default: true },
  compact: Boolean,
});
const emit = defineEmits(['toggle']);

const name = computed(() => props.item.name || 'Coletável');
const tag = computed(() => collectibleTag(props.item));
const credit = computed(() => cleanCredit(props.item.credit));
const video = computed(() => normalizeUrl(props.item.video ?? ''));
const images = computed(() => (props.item.images ?? []).map((u) => normalizeUrl(u)).filter(Boolean));
const hasBody = computed(() => !!(props.item.type || props.item.location || props.item.description || images.value.length || video.value || credit.value));

const expanded = ref(false);
const open = computed(() => !props.compact || expanded.value);
</script>

<template>
  <article
    :id="collectibleAnchorId(item.id)"
    class="ccard radius-2"
    :class="{ 'is-collected': collected, 'is-compact': compact, 'is-open': open }"
  >
    <!-- Compacto: caixa + número + nome; tocar abre os detalhes -->
    <div v-if="compact" class="ccard__row d-flex align-center gap-2 px-2 py-1">
      <button
        v-if="canToggle"
        type="button"
        class="ccard__box d-flex align-center justify-center radius-1 shrink-0"
        :aria-pressed="collected"
        :aria-label="collected ? `Desmarcar ${name}` : `Marcar ${name} como coletado`"
        @click="emit('toggle', item.id)"
      >
        <Check v-if="collected" :size="16" :stroke-width="3" />
      </button>
      <button type="button" class="ccard__summary d-flex align-center gap-2 flex-1 min-w-0" :aria-expanded="expanded" @click="expanded = !expanded">
        <span class="ccard__n text-xs fw-700 shrink-0">{{ item.n ? `#${item.n}` : '' }}</span>
        <span class="d-flex flex-column min-w-0">
          <span class="fw-600 truncate">{{ name }}</span>
          <span v-if="item.type || item.location" class="text-xs text-muted truncate">{{ [item.type, item.location].filter(Boolean).join(' · ') }}</span>
        </span>
        <span class="d-flex align-center gap-1 ml-auto shrink-0">
          <TriangleAlert v-if="item.missable" :size="16" class="ccard__warn" aria-label="Perdível" />
          <ChevronDown v-if="hasBody" :size="16" class="ccard__chevron" />
        </span>
      </button>
    </div>

    <header v-else class="ccard__name d-flex align-center gap-1 px-2 py-1">
      <span class="ccard__side text-xs fw-700">{{ tag }}</span>
      <span class="flex-1 text-center">{{ name }}</span>
      <span class="ccard__side d-flex justify-end gap-1">
        <span v-if="item.missable" class="badge badge--warning"><TriangleAlert :size="12" /> Perdível</span>
        <span v-if="item.uncounted" class="badge" data-tooltip="Aparece no jogo, mas não conta para o troféu">Não conta</span>
      </span>
    </header>

    <template v-if="open && (!compact || hasBody)">
      <div v-if="compact && (item.missable || item.uncounted)" class="ccard__flags d-flex flex-wrap gap-1 px-2 py-1">
        <span v-if="item.missable" class="badge badge--warning"><TriangleAlert :size="12" /> Perdível</span>
        <span v-if="item.uncounted" class="badge">Não conta para o troféu</span>
      </div>

      <div v-if="!compact && (item.type || item.location)" class="ccard__meta">
        <p v-if="item.type"><span class="kicker">Tipo</span> {{ item.type }}</p>
        <p v-if="item.location"><span class="kicker">Local</span> {{ item.location }}</p>
      </div>

      <p v-if="item.description" class="ccard__desc px-2 py-2">{{ item.description }}</p>

      <div v-if="images.length" class="ccard__images p-2" :class="{ 'is-single': images.length === 1 }">
        <a v-for="(src, i) in images" :key="i" :href="src" target="_blank" rel="noopener noreferrer" class="radius-1">
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

    <label v-if="canToggle && !compact" class="ccard__check d-flex align-center gap-2 m-2 p-2 radius-1">
      <input type="checkbox" class="sr-only" :checked="collected" @change="emit('toggle', item.id)" />
      <span class="ccard__box d-flex align-center justify-center radius-1 shrink-0"><Check v-if="collected" :size="16" :stroke-width="3" /></span>
      <span class="fw-600">{{ name }}</span>
      <span v-if="collected" class="ccard__done text-xs fw-600 ml-auto">Coletado</span>
    </label>
  </article>
</template>

<style lang="scss" scoped>
.ccard {
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface);
  scroll-margin-top: calc(var(--nav-offset) + var(--pbar-gap) + var(--pbar-height) + 64px);
  transition: border-color 0.2s;

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
    white-space: pre-line;
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

  &.is-collected &__box {
    background: var(--earned);
    border-color: var(--earned);
  }

  &__done {
    color: var(--earned);
  }
}
</style>
