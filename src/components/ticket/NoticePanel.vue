<script setup>
defineProps({
  checkType: { type: String, required: true },
  hasRealName: { type: Boolean, required: true },
  validityPeriod: { type: String, required: true }
})
</script>

<template>
  <section class="tab-panel">
    <div class="section-heading"><h2>购票须知</h2><span>下单前阅读</span></div>
    <van-cell-group inset class="notice-card">
      <van-cell title="核验方式" :value="checkType" />
      <van-cell title="实名制" :value="hasRealName ? '需要填写游客信息' : '按数量核验'" />
      <van-cell title="有效期" :value="validityPeriod" />
    </van-cell-group>
  </section>
</template>
