<script setup>
import { ref, watch } from 'vue';
import { ArrowLeftRight } from 'lucide-vue-next';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import GamePicker from '@/components/games/GamePicker.vue';
import SelectedGameCard from './SelectedGameCard.vue';
import { useMoveGuide } from '@/composables/guide/useMoveGuide';
import { useGuideDraft } from '@/composables/guide/useGuideDraft';
import { useToast } from '@/composables/useToast';

// Trocar o jogo do guia aberto no editor: escolhe o jogo → confirma → o guia (e os das DLCs) passa para ele.
// Emite 'moved' com o id novo (o editor vai para ele).
const open = defineModel({ type: Boolean, default: false });
const emit = defineEmits(['moved']);

const { draft, settle, discard } = useGuideDraft();
const { blocked, move } = useMoveGuide();
const toast = useToast();
const target = ref(null);
const busy = ref(false);
const error = ref('');

watch(open, (v) => v && ((target.value = null), (error.value = '')));
watch(target, () => (error.value = '')); // erro era do jogo anterior

async function confirm() {
  busy.value = true;
  error.value = '';
  try {
    await settle(); // nada pendente do guia antigo chega depois e recria ele
    const id = await move(JSON.parse(JSON.stringify(draft.value)), target.value);
    discard();
    open.value = false;
    toast.show(`O guia agora é de ${target.value.title}.`, 'success');
    emit('moved', id, target.value);
  } catch (e) {
    console.error('[guia] Falha ao trocar o jogo', e);
    error.value = e.message || 'Não foi possível trocar o jogo. Tente de novo.';
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <BaseModal v-model="open" title="Trocar o jogo do guia">
    <div class="d-flex flex-column gap-2">
      <p class="text-sm text-muted">
        Tudo o que você fez (dicas, abas, listas de troféus vinculadas e status) passa para o jogo escolhido — os
        guias das DLCs também. Use para corrigir a versão (ex.: a edição Director's Cut).
      </p>

      <template v-if="target">
        <SelectedGameCard :game="target" @change="target = null" />
        <p v-if="error || blocked" class="text-sm text-danger">{{ error || blocked }}</p>
      </template>
      <GamePicker v-else inline autofocus @select="target = $event" />
    </div>

    <template #footer>
      <span class="flex-1" />
      <BaseButton @click="open = false">Cancelar</BaseButton>
      <BaseButton variant="primary" :icon="ArrowLeftRight" :disabled="!target || !!blocked" :loading="busy" @click="confirm">
        Trocar jogo
      </BaseButton>
    </template>
  </BaseModal>
</template>
