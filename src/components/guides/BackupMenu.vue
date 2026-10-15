<script setup>
import { ref, useTemplateRef } from 'vue';
import { DatabaseBackup, Download, Upload } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import DropdownMenu from '@/components/ui/DropdownMenu.vue';
import ImportBackupModal from './ImportBackupModal.vue';
import { useBackup } from '@/composables/guide/useBackup';
import { useToast } from '@/composables/useToast';
import { parseBackup, planImport } from '@/utils/backup';

// Backup em Meus guias: exportar todos os guias (.json) e importar um backup (com confirmação do que muda).
// docs = Map id → guia completo (useMyGuides). Importou → emite 'imported' (a lista recarrega).
const props = defineProps({ docs: { type: Map, required: true } });
const emit = defineEmits(['imported']);

const { blocked, exportAll, importGuides } = useBackup(() => props.docs);
const toast = useToast();
const fileInput = useTemplateRef('file');
const importing = ref(null); // { plan, exportedAt, skipped }
const open = ref(false);
const busy = ref(false);

function onExport() {
  const n = exportAll();
  toast.show(n ? `${n} guia(s) exportado(s).` : 'Nenhum guia para exportar.', n ? 'success' : 'info');
}

async function onFile(e) {
  const file = e.target.files?.[0];
  e.target.value = ''; // permite escolher o mesmo arquivo de novo
  if (!file) return;
  try {
    const { guides, exportedAt, skipped } = parseBackup(await file.text());
    importing.value = { plan: planImport(guides, props.docs), exportedAt, skipped };
    open.value = true;
  } catch (err) {
    toast.show(err.message, 'error');
  }
}

async function confirm(guides) {
  busy.value = true;
  try {
    await importGuides(guides);
    open.value = false;
    toast.show(`${guides.length} guia(s) importado(s).`, 'success');
    emit('imported');
  } catch (err) {
    console.error('[backup] Falha ao importar', err);
    toast.show(blocked.value || 'Não foi possível importar. Tente de novo.', 'error');
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <DropdownMenu label="Backup dos guias">
    <template #trigger="{ open: menuOpen, toggle }">
      <BaseButton :icon="DatabaseBackup" aria-haspopup="menu" :aria-expanded="menuOpen" @click="toggle">Backup</BaseButton>
    </template>
    <template #default="{ close }">
      <button type="button" role="menuitem" class="menu__item" @click="onExport(), close()">
        <Download :size="16" /> Exportar todos (.json)
      </button>
      <button type="button" role="menuitem" class="menu__item" @click="fileInput.click(), close()">
        <Upload :size="16" /> Importar backup…
      </button>
    </template>
  </DropdownMenu>
  <input ref="file" type="file" accept="application/json,.json" class="d-none" @change="onFile" />

  <ImportBackupModal
    v-model="open"
    :plan="importing?.plan ?? []"
    :exported-at="importing?.exportedAt"
    :skipped="importing?.skipped ?? 0"
    :blocked="blocked"
    :busy="busy"
    @confirm="confirm"
  />
</template>
