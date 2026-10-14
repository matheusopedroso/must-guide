<script setup>
import { computed } from 'vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import CollectibleCard from './CollectibleCard.vue';
import { useCollectibleContext } from '@/composables/guide/useCollectibles';

// Detalhes de um coletável citado no texto (tocar no nome do chip): o mesmo cartão da aba Coletáveis
const id = defineModel({ type: String, default: null });
const col = useCollectibleContext();
const item = computed(() => (id.value ? col?.byId.value.get(id.value) : null));
const open = computed({ get: () => !!item.value, set: (v) => !v && (id.value = null) });
</script>

<template>
  <BaseModal v-model="open" :title="item?.region ? `Coletável · ${item.region}` : 'Coletável'" wide>
    <CollectibleCard v-if="item" :item="item" :collected="col.collected.value.has(item.id)" :can-toggle="!!col.toggle" @toggle="col.toggle" />
  </BaseModal>
</template>
