<script setup>
import { Check } from 'lucide-vue-next';
import { collectibleAnchorId } from '@/utils/collectibles';

// Cartão do coletável na leitura (modelo do IGN): nome no topo, Tipo | Local, descrição,
// imagens e a caixa para marcar. Marcado = fundo verde (mesma cor de troféu conquistado).
defineProps({
  item: { type: Object, required: true },
  collected: Boolean,
  canToggle: { type: Boolean, default: true },
});
defineEmits(['toggle']);
</script>

<template>
  <article :id="collectibleAnchorId(item.id)" class="ccard radius-2" :class="{ 'is-collected': collected }">
    <header class="ccard__name px-2 py-1">{{ item.name || 'Coletável' }}</header>

    <div v-if="item.type || item.location" class="ccard__meta">
      <p v-if="item.type"><span class="kicker">Tipo</span> {{ item.type }}</p>
      <p v-if="item.location"><span class="kicker">Local</span> {{ item.location }}</p>
    </div>

    <p v-if="item.description" class="ccard__desc px-2 py-2">{{ item.description }}</p>

    <div v-if="item.images?.length" class="ccard__images p-2" :class="{ 'is-single': item.images.length === 1 }">
      <a v-for="(src, i) in item.images" :key="i" :href="src" target="_blank" rel="noopener noreferrer" class="radius-1">
        <img :src="src" :alt="`${item.name} — imagem ${i + 1}`" loading="lazy" decoding="async" />
      </a>
    </div>

    <label v-if="canToggle" class="ccard__check d-flex align-center gap-2 m-2 p-2 radius-1">
      <input type="checkbox" class="sr-only" :checked="collected" @change="$emit('toggle', item.id)" />
      <span class="ccard__box d-flex align-center justify-center radius-1 shrink-0"><Check v-if="collected" :size="16" :stroke-width="3" /></span>
      <span class="fw-600">{{ item.name || 'Coletável' }}</span>
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
    background: var(--accent-soft);
    color: var(--text);
    font-weight: 700;
    text-align: center;
    transition: background 0.2s;
  }

  &.is-collected {
    border-color: color-mix(in srgb, var(--earned) 45%, transparent);
  }

  &.is-collected &__name {
    background: color-mix(in srgb, var(--earned) 22%, transparent);
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
