<template>
  <div class="page-shell">
    <slot />
  </div>
</template>

<style scoped>
.page-shell {
  width: min(100%, 460px);
  min-height: 100dvh;
  margin: 0 auto;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 16px 42px rgba(23, 62, 58, .13);
}

@media (min-width: 700px) {
  .page-shell {
    margin: 24px auto;
    border-radius: 22px;
  }
}
</style>
