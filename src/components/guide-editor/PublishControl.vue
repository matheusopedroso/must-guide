<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { EllipsisVertical, Eye, Globe, Link as LinkIcon, Trash2, Undo2 } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import DropdownMenu from '@/components/ui/DropdownMenu.vue';
import DeleteGuideModal from '@/components/guides/DeleteGuideModal.vue';
import { useGuideDraft } from '@/composables/guide/useGuideDraft';
import { useToast } from '@/composables/useToast';
import { absoluteUrl, copyText } from '@/utils/share';
import { guideIdOf } from '@/utils/guideIds';
import { summarizeGuide } from '@/utils/guideDraft';
import { ensureListCopies } from '@/services/trophyListSource';

// Publicar o guia (rascunho → publicado) e o menu de ações: copiar link e voltar para rascunho (publicado)
// e apagar o guia. Publicar exige o admin logado (grava na nuvem) e a lista de troféus vinculada.
const { draft, cloud, setStatus, discard } = useGuideDraft();
const router = useRouter();
const toast = useToast();

const published = computed(() => draft.value.status === 'published');
const viewRoute = computed(() => ({ name: 'guide-view', params: { id: guideIdOf(draft.value) } }));
const blocked = computed(() => {
  if (!cloud.value) return 'Entre como administrador para publicar';
  if (!draft.value.versions.length) return 'Vincule a lista de troféus antes de publicar';
  return '';
});

const confirming = ref(null); // 'published' | 'draft' | null
const busy = ref(false);
const COPY = {
  published: {
    title: 'Publicar guia',
    text: 'Qualquer pessoa com o link poderá ver o guia. Você continua editando normalmente: as mudanças aparecem na hora.',
    action: 'Publicar',
    done: 'Guia publicado!',
  },
  draft: {
    title: 'Voltar para rascunho',
    text: 'O guia sai do ar: só você continua vendo e editando.',
    action: 'Voltar para rascunho',
    done: 'Guia voltou para rascunho.',
  },
};
const copy = computed(() => COPY[confirming.value] ?? COPY.published);

async function confirm() {
  busy.value = true;
  const next = confirming.value;
  const ok = await setStatus(next);
  // Publicou: garante a cópia das listas de troféus na nuvem (quem lê não depende da API da PSN)
  if (ok && next === 'published') ensureListCopies(draft.value.versions);
  busy.value = false;
  confirming.value = null;
  toast.show(ok ? copy.value.done : 'Não foi possível salvar na nuvem. Tente de novo.', ok ? 'success' : 'error');
}

// Apagar: o modal confirma e apaga; aqui para de gravar e sai (DLC → aba DLCs do jogo; jogo → Meus guias)
const deleting = ref(false);
const summary = computed(() => (deleting.value ? summarizeGuide(draft.value) : null));

function onDeleted() {
  const d = draft.value;
  const back = d.dlc ? { name: 'guide-edit', params: { id: d.parentId }, query: { aba: 'dlc' } } : { name: 'my-guides' };
  discard();
  router.push(back);
}

async function copyLink() {
  const ok = await copyText(absoluteUrl(router, viewRoute.value));
  toast.show(ok ? 'Link copiado.' : 'Não foi possível copiar o link.', ok ? 'success' : 'error');
}
</script>

<template>
  <div class="d-flex align-center gap-1">
    <span v-if="published" class="badge badge--success"><Globe :size="14" /> Publicado</span>
    <BaseButton :to="viewRoute" :icon="Eye" size="sm" variant="ghost">Visualizar</BaseButton>

    <span v-if="!published" class="d-inline-flex tooltip-left" :data-tooltip="blocked || null">
      <BaseButton :icon="Globe" size="sm" variant="primary" :disabled="!!blocked" @click="confirming = 'published'">
        Publicar
      </BaseButton>
    </span>

    <DropdownMenu label="Ações do guia">
      <template #trigger="{ open, toggle }">
        <BaseButton
          :icon="EllipsisVertical"
          icon-only
          size="sm"
          variant="ghost"
          aria-label="Mais ações"
          aria-haspopup="menu"
          :aria-expanded="open"
          @click="toggle"
        />
      </template>
      <template #default="{ close }">
        <template v-if="published">
          <button type="button" role="menuitem" class="menu__item" @click="copyLink(), close()">
            <LinkIcon :size="16" /> Copiar link
          </button>
          <button type="button" role="menuitem" class="menu__item" :disabled="!!blocked" @click="(confirming = 'draft'), close()">
            <Undo2 :size="16" /> Voltar para rascunho
          </button>
        </template>
        <button type="button" role="menuitem" class="menu__item menu__item--danger" @click="(deleting = true), close()">
          <Trash2 :size="16" /> Apagar guia
        </button>
      </template>
    </DropdownMenu>
  </div>

  <DeleteGuideModal v-model="deleting" :guide="summary" @deleted="onDeleted" />

  <BaseModal :model-value="!!confirming" :title="copy.title" @update:model-value="(v) => !v && (confirming = null)">
    <p class="text-muted">{{ copy.text }}</p>
    <template #footer>
      <span class="flex-1" />
      <BaseButton @click="confirming = null">Cancelar</BaseButton>
      <BaseButton :variant="confirming === 'draft' ? 'secondary' : 'primary'" :loading="busy" @click="confirm">
        {{ copy.action }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
