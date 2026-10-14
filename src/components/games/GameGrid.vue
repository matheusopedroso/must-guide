<template>
  <div class="grid d-grid gap-y-3">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.grid {
  // 3 colunas no celular (390px); cresce conforme a largura
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  column-gap: space(2);

  @include up(sm) {
    grid-template-columns: repeat(auto-fill, minmax(144px, 1fr));
    column-gap: space(3);
  }

  @include up(lg) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>
