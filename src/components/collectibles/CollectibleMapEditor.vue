<script setup>
import { computed, ref, useTemplateRef, watch } from 'vue';
import { Check, MapPinOff } from 'lucide-vue-next';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { pinFromClick, pinLabel } from '@/utils/collectibles';
import { normalizeUrl } from '@/utils/url';

// Editor: marcar no mapa da região onde fica cada coletável. Escolha o coletável na lista e toque no mapa;
// depois de marcar, passa sozinho para o próximo sem ponto. Tocar num ponto escolhe aquele coletável.
// Grava na hora (emit pin: itemId, { x, y } | null).
const open = defineModel({ type: Boolean, default: false });
const props = defineProps({
  src: { type: String, required: true },
  items: { type: Array, default: () => [] }, // coletáveis da região (com n, quando houver)
  title: { type: String, default: 'Mapa da região' },
});
const emit = defineEmits(['pin']);

const url = computed(() => normalizeUrl(props.src));
const selectedId = ref(null);
const selected = computed(() => props.items.find((i) => i.id === selectedId.value) ?? null);
const nextFree = (after = null) => {
  const start = after ? props.items.findIndex((i) => i.id === after) + 1 : 0;
  return [...props.items.slice(start), ...props.items.slice(0, start)].find((i) => !i.pin && i.id !== after)?.id ?? null;
};
watch(open, (v) => v && (selectedId.value = nextFree() ?? props.items[0]?.id ?? null), { immediate: true });

const img = useTemplateRef('img');
function place(e) {
  if (!selected.value) return;
  const id = selected.value.id;
  emit('pin', id, pinFromClick(e, img.value));
  selectedId.value = nextFree(id) ?? id; // próximo sem ponto (ou fica no mesmo)
}
const pinned = computed(() => props.items.filter((i) => i.pin).length);
</script>

<template>
  <BaseModal v-model="open" :title="`Pontos no mapa · ${title}`" description="Escolha o coletável e toque no mapa onde ele fica." wide>
    <div class="d-flex flex-column gap-2">
      <div class="d-flex flex-wrap gap-1" role="group" aria-label="Coletável para marcar">
        <button
          v-for="it in items"
          :key="it.id"
          type="button"
          class="chip chip--sm"
          :class="{ 'is-active': it.id === selectedId }"
          :aria-pressed="it.id === selectedId"
          @click="selectedId = it.id"
        >
          <Check v-if="it.pin" :size="14" :stroke-width="3" class="text-earned" />
          <strong>{{ pinLabel(it) }}</strong> {{ it.name || 'Coletável' }}
        </button>
      </div>

      <div class="map radius-1">
        <img ref="img" :src="url" :alt="title" class="map__img" @click="place" />
        <button
          v-for="it in items.filter((i) => i.pin)"
          :key="it.id"
          type="button"
          class="map__pin d-flex align-center justify-center radius-full text-xs fw-700"
          :class="{ 'is-selected': it.id === selectedId }"
          :style="{ left: `${it.pin.x}%`, top: `${it.pin.y}%` }"
          :aria-label="`Escolher ${it.name}`"
          @click="selectedId = it.id"
        >
          {{ pinLabel(it) }}
        </button>
      </div>
    </div>

    <template #footer>
      <span class="text-sm text-muted">{{ pinned }} de {{ items.length }} no mapa</span>
      <span class="flex-1" />
      <BaseButton v-if="selected?.pin" :icon="MapPinOff" size="sm" variant="ghost" @click="emit('pin', selected.id, null)">Tirar ponto</BaseButton>
      <BaseButton variant="primary" @click="open = false">Pronto</BaseButton>
    </template>
  </BaseModal>
</template>

<style lang="scss" scoped>
.map {
  position: relative;
  overflow: hidden;
  background: var(--surface-2);

  &__img {
    display: block;
    width: 100%;
    height: auto;
    cursor: crosshair;
  }

  &__pin {
    position: absolute;
    min-width: 28px;
    height: 28px;
    padding-inline: $space-half;
    transform: translate(-50%, -50%);
    border: 2px solid #fff;
    background: var(--surface);
    color: var(--text);
    box-shadow: 0 2px 8px rgb(0 0 0 / 40%);

    &.is-selected {
      background: var(--accent);
      color: #fff;
    }
  }
}
</style>
