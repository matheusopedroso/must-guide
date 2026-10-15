<script setup>
import { computed, ref } from 'vue';
import { Trash2 } from 'lucide-vue-next';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useDeleteGuide } from '@/composables/guide/useDeleteGuide';
import { useDlcGuides } from '@/composables/guide/useDlcGuides';
import { useToast } from '@/composables/useToast';
import { useAuth } from '@/composables/useAuth';

// Confirmação para apagar um guia (Meus guias e editor). O guia de um jogo leva junto os das DLCs dele,
// para não ficarem soltos. Apagou → emite 'deleted' com os ids (quem abriu tira da tela / sai do editor).
const open = defineModel({ type: Boolean, default: false });
const props = defineProps({
  guide: { type: Object, default: null }, // summarizeGuide(): { guideId, title, dlc, status }
});
const emit = defineEmits(['deleted']);

const { enabled } = useAuth();
const { blocked, remove } = useDeleteGuide();
const toast = useToast();
const busy = ref(false);

const { items: dlcs, loading } = useDlcGuides(computed(() => (open.value && props.guide && !props.guide.dlc ? props.guide.guideId : '')));
const where = computed(() => {
  const place = enabled ? 'da nuvem e deste navegador' : 'deste navegador';
  return props.guide?.status === 'published' ? `sai do ar e é apagado ${place}` : `é apagado ${place}`;
});

async function confirm() {
  const ids = [props.guide.guideId, ...dlcs.value.map((d) => d.guideId)];
  busy.value = true;
  try {
    await remove(ids);
    open.value = false;
    toast.show(ids.length > 1 ? `Guia e ${ids.length - 1} guia(s) de DLC apagados.` : 'Guia apagado.', 'success');
    emit('deleted', ids);
  } catch (e) {
    console.error('[guia] Falha ao apagar', e);
    toast.show(blocked.value || 'Não foi possível apagar. Tente de novo.', 'error');
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <BaseModal v-model="open" title="Apagar guia">
    <div v-if="guide" class="d-flex flex-column gap-2">
      <p class="text-muted">
        O guia <strong class="name">{{ guide.title }}</strong> {{ where }}, com todas as dicas e abas. Não dá para desfazer.
      </p>
      <div v-if="dlcs.length" class="d-flex flex-column gap-1">
        <p class="text-sm text-muted">Também apaga os guias das DLCs deste jogo:</p>
        <ul class="d-flex flex-wrap gap-1">
          <li v-for="d in dlcs" :key="d.guideId" class="tag">{{ d.title }}</li>
        </ul>
      </div>
      <p v-if="blocked" class="text-sm text-danger">{{ blocked }}.</p>
    </div>
    <template #footer>
      <span class="flex-1" />
      <BaseButton @click="open = false">Cancelar</BaseButton>
      <BaseButton variant="danger" :icon="Trash2" :loading="busy" :disabled="loading || !!blocked" @click="confirm">
        Apagar
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style lang="scss" scoped>
.name {
  color: var(--text);
}
</style>
