<script setup>
defineProps({
  heroImage: { type: String, required: true },
  scenicIntro: { type: String, required: true }
})

const emit = defineEmits(['back', 'share'])
</script>

<template>
  <section class="hero-card">
    <img class="hero-image" :src="heroImage" alt="梅花山景区山地风景" />
    <div class="hero-mask"></div>
    <div class="hero-actions">
      <button type="button" aria-label="返回" @click="emit('back')"><van-icon name="arrow-left" size="24" /></button>
      <button type="button" aria-label="分享" @click="emit('share')"><van-icon name="share-o" size="24" /></button>
    </div>
    <div class="hero-content">
      <p>⌖ 贵州 · 六盘水 · 梅花山景区</p>
      <h1>梅花山景区门票</h1>
      <span>{{ scenicIntro }}</span>
    </div>
  </section>
</template>
