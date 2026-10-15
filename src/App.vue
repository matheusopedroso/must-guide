<script setup>
import AppNav from '@/components/layout/AppNav.vue';
import MobileTabBar from '@/components/layout/MobileTabBar.vue';
import ToastHost from '@/components/ui/ToastHost.vue';
import LightboxHost from '@/components/layout/LightboxHost.vue';
import OfflineBar from '@/components/layout/OfflineBar.vue';
import { useNavVisibility } from '@/composables/useNavVisibility';

const { topHidden, bottomHidden } = useNavVisibility();
</script>

<template>
  <AppNav :hidden="topHidden" />
  <main class="app-main">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </main>
  <MobileTabBar :hidden="bottomHidden" />
  <ToastHost />
  <LightboxHost />
  <OfflineBar />
</template>

<style lang="scss">
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s $ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
