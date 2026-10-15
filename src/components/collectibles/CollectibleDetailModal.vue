<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseModal from '@/components/ui/BaseModal.vue';
import CollectibleCard from './CollectibleCard.vue';
import { useCollectibleContext } from '@/composables/guide/useCollectibles';
import { groupOf } from '@/utils/collectibles';
import { trophyPageRoute } from '@/utils/trophyRef';

// Detalhes de um coletável citado no texto (tocar no nome do chip): o mesmo cartão da aba Coletáveis
// (com os que são pegos no mesmo lugar)
const id = defineModel({ type: String, default: null });
const col = useCollectibleContext();
const item = computed(() => (id.value ? col?.byId.value.get(id.value) : null));
// Pego junto com outros no mesmo lugar: mostra o cartão do grupo
const group = computed(() => (item.value ? groupOf(col.items.value, item.value.id) : null));
const isDone = (i) => !!col?.collected?.value.has(i);
// Troféu citado no "como achar" → página do troféu
const route = useRoute();
const router = useRouter();
function openTrophy(trophyId) {
  id.value = null;
  router.push(trophyPageRoute(String(route.params.id), trophyId));
}
const open = computed({ get: () => !!item.value, set: (v) => !v && (id.value = null) });
</script>

<template>
  <BaseModal v-model="open" :title="item?.region ? `Coletável · ${item.region}` : 'Coletável'" wide>
    <CollectibleCard v-if="group" :items="group" :is-done="isDone" :can-toggle="!!col.toggle" @toggle="col.toggle" @open-trophy="openTrophy" />
  </BaseModal>
</template>
