<script setup>
import { reactive, watch } from 'vue';
import { ImagePlus, Trash2, X } from 'lucide-vue-next';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { MAX_IMAGES } from '@/utils/collectibles';
import { normalizeUrl } from '@/utils/url';

// Edição de um coletável (editor): nome, tipo, local/checkpoint, descrição e imagens (links).
// Edita uma cópia e grava só no "Salvar".
const open = defineModel({ type: Boolean, default: false });
const props = defineProps({
  item: { type: Object, default: null },
  types: { type: Array, default: () => [] }, // tipos já usados no guia (sugestões)
});
const emit = defineEmits(['save', 'remove']);

const form = reactive({ name: '', type: '', location: '', description: '', images: [] });
watch(open, (v) => {
  if (v && props.item) Object.assign(form, { ...props.item, images: [...(props.item.images ?? [])] });
});

const addImage = () => form.images.length < MAX_IMAGES && form.images.push('');

function save() {
  emit('save', {
    name: form.name.trim(),
    type: form.type.trim(),
    location: form.location.trim(),
    description: form.description.trim(),
    images: form.images.map((u) => normalizeUrl(u.trim())).filter(Boolean),
  });
  open.value = false;
}
</script>

<template>
  <BaseModal v-model="open" title="Coletável" wide>
    <form class="d-flex flex-column gap-2" @submit.prevent="save">
      <label class="field">
        <span class="field__label">Nome *</span>
        <input v-model="form.name" class="input" required placeholder="Ex.: Cruciform Key" />
      </label>

      <div class="grid-2">
        <label class="field">
          <span class="field__label">Tipo</span>
          <input v-model="form.type" class="input" list="collectible-types" placeholder="Ex.: Legacy Item, Documento" />
          <datalist id="collectible-types">
            <option v-for="t in types" :key="t" :value="t" />
          </datalist>
        </label>
        <label class="field">
          <span class="field__label">Local / checkpoint</span>
          <input v-model="form.location" class="input" placeholder="Ex.: 06 Central Camp" />
        </label>
      </div>

      <label class="field">
        <span class="field__label">Como achar</span>
        <textarea v-model="form.description" class="input" rows="4" placeholder="Onde fica e como chegar até ele." />
      </label>

      <div class="field">
        <span class="field__label">Imagens (links, até {{ MAX_IMAGES }})</span>
        <div v-for="(url, i) in form.images" :key="i" class="d-flex align-center gap-1">
          <img v-if="url" :src="url" alt="" class="thumb radius-1 shrink-0" />
          <input v-model="form.images[i]" class="input" type="url" placeholder="https://…/imagem.jpg" />
          <BaseButton :icon="X" icon-only size="sm" variant="ghost" aria-label="Tirar imagem" @click="form.images.splice(i, 1)" />
        </div>
        <BaseButton v-if="form.images.length < MAX_IMAGES" :icon="ImagePlus" size="sm" variant="ghost" class="align-self-start" @click="addImage">
          Adicionar imagem
        </BaseButton>
      </div>
    </form>

    <template #footer>
      <BaseButton :icon="Trash2" size="sm" variant="danger" @click="$emit('remove'), (open = false)">Excluir</BaseButton>
      <span class="flex-1" />
      <BaseButton @click="open = false">Cancelar</BaseButton>
      <BaseButton variant="primary" :disabled="!form.name.trim()" @click="save">Salvar</BaseButton>
    </template>
  </BaseModal>
</template>

<style lang="scss" scoped>
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: space(2);

  @include down(sm) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.thumb {
  width: 56px;
  height: 40px;
  object-fit: cover;
  background: var(--surface-2);
}

.align-self-start {
  align-self: flex-start;
}
</style>
