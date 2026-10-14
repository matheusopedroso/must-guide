<script setup>
import AppHeader from '@/components/layout/AppHeader.vue';
</script>

<template>
  <AppHeader />
  <main>
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </main>
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
