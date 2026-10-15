<script setup>
import { computed } from 'vue';
import { Clock, Gauge, Gem, Repeat, Trophy } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import GameAbout from '@/components/games/GameAbout.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import TrophyCounts from '@/components/trophies/TrophyCounts.vue';
import DifficultyBadge from '@/components/guide-editor/DifficultyBadge.vue';
import { TROPHY_FLAGS } from '@/config/trophies';
import { hasRichContent } from '@/utils/html';
import { formatDate } from '@/utils/date';
import { useCollectibleContext } from '@/composables/guide/useCollectibles';

// Aba "Visão geral" da leitura (como a aba Detalhes do Must Watch):
// sobre o jogo + ficha à esquerda, cartão "Para platinar" à direita e, embaixo,
// os troféus que pedem atenção (Perdíveis, História, Online). Tocar num troféu abre a aba Troféus nele.
const props = defineProps({
  guide: { type: Object, required: true },
  game: { type: Object, default: null },
  list: { type: Object, default: null }, // lista de troféus da versão aberta (pode estar carregando)
  getNote: { type: Function, required: true },
});
defineEmits(['open-trophy', 'open-trophies']);

const stats = computed(() => props.guide.stats ?? {});

// Uma passada: dicas escritas + troféus de cada marcação
const summary = computed(() => {
  const trophies = props.list?.trophies ?? [];
  const byFlag = Object.fromEntries(TROPHY_FLAGS.map((f) => [f.id, []]));
  let tips = 0;
  for (const t of trophies) {
    const note = props.getNote(t.id);
    if (hasRichContent(note.tip)) tips++;
    for (const f of TROPHY_FLAGS) if (note[f.id]) byFlag[f.id].push(t);
  }
  return { total: trophies.length, tips, flags: TROPHY_FLAGS.map((f) => ({ ...f, trophies: byFlag[f.id] })).filter((f) => f.trophies.length) };
});

// Coletáveis do guia e quantos você já marcou
const col = useCollectibleContext();
const collectibles = computed(() => {
  const items = col?.items.value ?? [];
  return items.length ? { total: items.length, done: items.filter((i) => col.collected?.value.has(i.id)).length } : null;
});

const PLAY_ROWS = [
  { id: 'playthroughs', icon: Repeat, label: 'Jogadas', format: (n) => `${n} ${n > 1 ? 'jogadas' : 'jogada'}` },
  { id: 'hours', icon: Clock, label: 'Tempo', format: (n) => `~${n} h` },
];
</script>

<template>
  <div class="overview d-flex flex-column gap-3">
    <div class="overview__grid">
      <!-- Sobre o jogo + ficha -->
      <div class="d-flex flex-column gap-3 min-w-0">
        <GameAbout :game="game" :title="guide.dlc ? 'Sobre o jogo base' : 'Sobre o jogo'" />

        <div class="label-row">
          <span class="kicker">Versões</span>
          <div class="d-flex flex-wrap gap-1">
            <span v-for="(v, i) in guide.versions" :key="v.id" class="pill" :title="v.name">
              <strong>{{ v.platform || v.id }}</strong> {{ i === 0 && guide.versions.length > 1 ? '· principal' : '' }}
            </span>
          </div>
        </div>

        <dl class="facts">
          <div v-if="list">
            <dt>Troféus</dt>
            <dd class="d-flex align-center flex-wrap gap-2">{{ summary.total }} <TrophyCounts :counts="list.counts" /></dd>
          </div>
          <div v-if="list">
            <dt>Dicas escritas</dt>
            <dd>{{ summary.tips }} de {{ summary.total }}</dd>
          </div>
          <div v-if="game?.year">
            <dt>Lançamento</dt>
            <dd>{{ game.year }}</dd>
          </div>
          <div v-if="game?.platforms?.length">
            <dt>Plataformas do jogo</dt>
            <dd>{{ game.platforms.join(' · ') }}</dd>
          </div>
          <div v-if="guide.publishedAt && guide.status === 'published'">
            <dt>Publicado em</dt>
            <dd>{{ formatDate(guide.publishedAt) }}</dd>
          </div>
          <div v-if="guide.updatedAt">
            <dt>Atualizado em</dt>
            <dd>{{ formatDate(guide.updatedAt) }}</dd>
          </div>
        </dl>
      </div>

      <!-- Para platinar (lugar do "Onde assistir") -->
      <aside class="card surface radius-2 p-2 d-flex flex-column gap-2">
        <p class="kicker">{{ guide.dlc ? 'Para completar a DLC' : 'Para platinar' }}</p>
        <div class="card__row d-flex align-center justify-between gap-1">
          <span class="d-inline-flex align-center gap-1 text-sm text-muted"><Gauge :size="16" /> Dificuldade</span>
          <DifficultyBadge v-if="stats.difficulty" :value="stats.difficulty" show-label />
          <span v-else class="text-sm text-subtle">—</span>
        </div>
        <div v-for="r in PLAY_ROWS" :key="r.id" class="card__row d-flex align-center justify-between gap-1">
          <span class="d-inline-flex align-center gap-1 text-sm text-muted"><component :is="r.icon" :size="16" /> {{ r.label }}</span>
          <span class="text-sm fw-600">{{ stats[r.id] ? r.format(stats[r.id]) : '—' }}</span>
        </div>
        <div v-if="collectibles" class="card__row d-flex align-center justify-between gap-1">
          <span class="d-inline-flex align-center gap-1 text-sm text-muted"><Gem :size="16" /> Coletáveis</span>
          <span class="text-sm fw-600">{{ collectibles.done }}/{{ collectibles.total }}</span>
        </div>
        <div v-if="list" class="d-flex flex-column gap-1">
          <span class="text-xs text-muted">Guia: {{ summary.tips }} de {{ summary.total }} troféus com dica</span>
          <ProgressBar :value="summary.tips" :max="summary.total || 1" />
        </div>
        <BaseButton :icon="Trophy" variant="primary" class="w-100" @click="$emit('open-trophies')">Ver troféus</BaseButton>
      </aside>
    </div>

    <!-- Troféus que pedem atenção: um cartão por marcação, no mesmo fundo do "Para platinar" -->
    <section v-for="f in summary.flags" :key="f.id" class="surface radius-2 p-2 d-flex flex-column gap-2">
      <h2 class="section-heading d-flex align-center gap-1">
        <span class="badge" :class="`badge--${f.tone}`"><component :is="f.icon" :size="14" :stroke-width="2" /></span>
        {{ f.label }} <span class="text-subtle fw-500">{{ f.trophies.length }}</span>
      </h2>
      <div class="d-flex flex-wrap gap-1 text-sm">
        <a
          v-for="t in f.trophies"
          :key="t.id"
          href="#"
          class="trophy-ref"
          :data-type="t.type"
          @click.prevent="$emit('open-trophy', t.id)"
        >
          {{ t.name || 'Troféu oculto' }}
        </a>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.overview {
  &__grid {
    margin-bottom: space(2);
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: space(3);

    @include up(md) {
      grid-template-columns: minmax(0, 1fr) 300px;
      gap: space(5);
      align-items: start;
    }
  }
}

.card {
  @include up(md) {
    position: sticky;
    top: calc(var(--nav-offset) + 160px); // abaixo da PageBar e das abas
  }

  &__row {
    min-height: 32px;
  }
}
</style>
