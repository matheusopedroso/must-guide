<script setup>
import { Gamepad2 } from 'lucide-vue-next';
import { useButtonStyle } from '@/composables/useButtonStyle';
import { BUTTON_STYLES } from '@/config/controllerKeys';

// Escolha do estilo dos botões de controle no texto (PlayStation / Xbox). Vale para o app todo e fica guardada.
const style = useButtonStyle();
</script>

<template>
  <div class="d-flex align-center flex-wrap gap-1" role="group" aria-label="Botões do controle">
    <span class="d-inline-flex align-center gap-1 text-xs text-muted"><Gamepad2 :size="14" /> Botões:</span>
    <button
      v-for="s in BUTTON_STYLES"
      :key="s.id"
      type="button"
      class="chip chip--sm"
      :class="{ 'is-active': style === s.id }"
      :aria-pressed="style === s.id"
      @click="style = s.id"
    >
      {{ s.label }}
    </button>
  </div>
</template>
