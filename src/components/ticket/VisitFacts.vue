<script setup>
defineProps({
  openingHours: { type: String, required: true },
  suggestedDuration: { type: String, required: true },
  scenicAddress: { type: String, required: true }
})
</script>

<template>
  <section class="visit-facts" aria-label="游客实用信息">
    <div class="visit-fact"><span class="visit-fact-icon"><van-icon name="clock-o" size="20" /></span><span class="visit-fact-content"><strong>{{ openingHours }}</strong><small>开放时间</small></span></div>
    <div class="visit-fact"><span class="visit-fact-icon"><van-icon name="guide-o" size="20" /></span><span class="visit-fact-content"><strong>{{ suggestedDuration }}</strong><small>建议游玩</small></span></div>
    <div class="visit-fact"><span class="visit-fact-icon"><van-icon name="location-o" size="20" /></span><span class="visit-fact-content"><strong>{{ scenicAddress }}</strong><small>景区地址</small></span></div>
  </section>
</template>
