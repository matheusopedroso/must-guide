<script setup>
import { computed, ref, watch } from 'vue';
import { ArchiveRestore } from 'lucide-vue-next';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { formatDateTime } from '@/utils/date';

// Confirmação do backup a importar: o que muda em cada guia. Por padrão entram os novos e os mais novos
// que os atuais; os mais antigos só se marcar (não apaga trabalho recente sem querer).
const open = defineModel({ type: Boolean, default: false });
const props = defineProps({
  plan: { type: Array, default: () => [] }, // planImport()
  exportedAt: { type: String, default: null },
  skipped: { type: Number, default: 0 },
  blocked: { type: String, default: '' },
  busy: Boolean,
});
const emit = defineEmits(['confirm']);

const includeOlder = ref(false);
watch(open, (v) => v && (includeOlder.value = false));

const STATUS = {
  new: { label: 'Novo', tone: 'success' },
  newer: { label: 'Mais novo que o atual', tone: 'info' },
  same: { label: 'Igual ao atual', tone: 'neutral' },
  older: { label: 'Mais antigo que o atual', tone: 'warning' },
};
const count = (s) => props.plan.filter((p) => p.status === s).length;
const chosen = computed(() => props.plan.filter((p) => ['new', 'newer'].includes(p.status) || (includeOlder.value && p.status === 'older')));
</script>

<template>
  <BaseModal v-model="open" title="Importar backup">
    <div class="d-flex flex-column gap-2">
      <p class="text-sm text-muted">
        {{ plan.length }} guia(s) no arquivo<span v-if="exportedAt">, exportado em {{ formatDateTime(exportedAt) }}</span>.
        <span v-if="skipped"> {{ skipped }} item(ns) inválido(s) foram ignorados.</span>
      </p>
      <ul class="list d-flex flex-column gap-1">
        <li v-for="p in plan" :key="p.id" class="d-flex align-center justify-between gap-1 text-sm">
          <span class="truncate">{{ p.title }}</span>
          <span class="badge shrink-0" :class="`badge--${STATUS[p.status].tone}`">{{ STATUS[p.status].label }}</span>
        </li>
      </ul>
      <label v-if="count('older')" class="checkbox text-sm">
        <input v-model="includeOlder" type="checkbox" />
        Substituir também {{ count('older') }} guia(s) que estão mais novos aqui
      </label>
      <p v-if="blocked" class="text-sm text-danger">{{ blocked }}.</p>
    </div>
    <template #footer>
      <span class="flex-1" />
      <BaseButton @click="open = false">Cancelar</BaseButton>
      <BaseButton
        variant="primary"
        :icon="ArchiveRestore"
        :loading="busy"
        :disabled="!chosen.length || !!blocked"
        @click="emit('confirm', chosen.map((p) => p.guide))"
      >
        {{ chosen.length ? `Importar ${chosen.length}` : 'Nada para importar' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style lang="scss" scoped>
.list {
  max-height: min(320px, 40dvh);
  overflow-y: auto;
}
</style>
