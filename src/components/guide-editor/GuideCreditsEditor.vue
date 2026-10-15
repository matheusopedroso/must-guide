<script setup>
import { computed, ref } from 'vue';
import { HeartHandshake, Plus, X } from 'lucide-vue-next';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useGuideDraft } from '@/composables/guide/useGuideDraft';
import { createCredit } from '@/utils/collectibles';
import { normalizeUrl } from '@/utils/url';

// Créditos do guia (editor): quem ajudou e com o quê — rota, imagens, vídeos, tradução… Aparecem no fim da
// leitura, junto com os créditos citados nos coletáveis. Edita uma cópia e grava só no "Salvar".
const { draft } = useGuideDraft();
const count = computed(() => draft.value?.credits?.length ?? 0);

const open = ref(false);
const rows = ref([]);
function edit() {
  rows.value = (draft.value.credits ?? []).map((c) => ({ ...c }));
  if (!rows.value.length) rows.value.push(createCredit());
  open.value = true;
}

const ROLES = ['Rota e textos', 'Imagens dos coletáveis', 'Vídeos', 'Revisão', 'Tradução'];

function save() {
  draft.value.credits = rows.value
    .map((c) => ({ id: c.id, name: c.name.trim(), url: normalizeUrl(c.url), role: c.role.trim() }))
    .filter((c) => c.name);
  open.value = false;
}
</script>

<template>
  <button
    type="button"
    class="credits-btn d-inline-flex align-center gap-1 radius-1 text-sm fw-500 tooltip-left"
    data-tooltip="Quem ajudou no guia"
    @click="edit"
  >
    <HeartHandshake :size="14" /> Créditos<span v-if="count" class="text-subtle">· {{ count }}</span>
  </button>

  <BaseModal v-model="open" title="Créditos do guia" description="Dê crédito a quem fez a rota, as imagens ou os vídeos. Aparece no fim da leitura." wide>
    <div class="d-flex flex-column gap-2">
      <div v-for="(c, i) in rows" :key="c.id" class="credit-row">
        <input v-model="c.name" class="input" placeholder="Nome (ex.: PowerPyx)" :aria-label="`Nome do crédito ${i + 1}`" />
        <input v-model="c.url" class="input" type="url" placeholder="Link (opcional)" :aria-label="`Link do crédito ${i + 1}`" />
        <input v-model="c.role" class="input" list="credit-roles" placeholder="O que fez (ex.: Imagens)" :aria-label="`O que fez ${i + 1}`" />
        <BaseButton :icon="X" icon-only size="sm" variant="ghost" :aria-label="`Tirar crédito ${i + 1}`" @click="rows.splice(i, 1)" />
      </div>
      <datalist id="credit-roles">
        <option v-for="r in ROLES" :key="r" :value="r" />
      </datalist>
      <BaseButton :icon="Plus" size="sm" variant="ghost" class="align-self-start" @click="rows.push(createCredit())">Adicionar crédito</BaseButton>
      <p class="text-xs text-subtle">O crédito escrito em cada coletável entra sozinho na lista da leitura (não precisa repetir aqui).</p>
    </div>

    <template #footer>
      <span class="flex-1" />
      <BaseButton @click="open = false">Cancelar</BaseButton>
      <BaseButton variant="primary" @click="save">Salvar</BaseButton>
    </template>
  </BaseModal>
</template>

<style lang="scss" scoped>
.credits-btn {
  min-height: 32px;
  padding-inline: space(1);
  color: var(--accent);
  transition: background 0.15s;

  &:hover {
    background: var(--surface-hover);
  }
}

.credit-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: space(1);
  align-items: center;

  @include down(sm) {
    grid-template-columns: minmax(0, 1fr) auto;
    padding-bottom: space(1);
    border-bottom: 1px solid var(--border);

    .input:not(:first-child) {
      grid-column: 1;
    }

    :deep(.btn) {
      grid-row: 1;
      grid-column: 2;
    }
  }
}

.align-self-start {
  align-self: flex-start;
}
</style>
