<template>
  <div class="skeleton d-flex flex-column gap-1" aria-hidden="true">
    <div class="skeleton__cover radius-1" />
    <div class="skeleton__line radius-1" />
    <div class="skeleton__line skeleton__line--short radius-1" />
  </div>
</template>

<style lang="scss" scoped>
.skeleton {
  &__cover,
  &__line {
    background: var(--surface-2);
    animation: pulse 1.4s ease-in-out infinite;
  }

  &__cover {
    aspect-ratio: 3 / 4;
  }

  &__line {
    height: 16px;

    &--short {
      width: 60%;
    }
  }
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}
</style>
