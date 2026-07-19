<script setup>
defineProps({
  status: { type: String, required: true },
  amount: { type: Number, required: true },
  orderNo: { type: String, required: true },
  orderStatusLabel: { type: String, required: true },
  dateLabel: { type: String, required: true },
  ticketSummary: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true }
})

const emit = defineEmits(['close', 'retry', 'view-order'])
</script>

<template>
  <section class="payment-page">
    <div class="payment-page-header"><button type="button" aria-label="返回" @click="emit('close')"><van-icon name="arrow-left" size="22" /></button><strong>支付结果</strong><span></span></div>
    <div class="payment-result"><div class="payment-mark" :class="`is-${status}`">{{ status === 'success' ? '✓' : '…' }}</div><h1>{{ title }}</h1><p>{{ description }}</p></div>
    <div class="payment-card"><div class="payment-amount"><span>实付金额</span><strong>¥{{ amount }}</strong></div><div><span>支付方式</span><strong>微信支付</strong></div><div><span>订单编号</span><strong>{{ orderNo || '订单创建中' }}</strong></div><div><span>订单状态</span><strong>{{ orderStatusLabel }}</strong></div><div><span>游玩日期</span><strong>{{ dateLabel }}</strong></div><div><span>已购票型</span><strong>{{ ticketSummary }}</strong></div></div>
    <div class="payment-actions"><van-button v-if="status === 'success'" type="primary" color="#173e3a" block round @click="emit('view-order')">查看订单</van-button><van-button v-else-if="status === 'failed'" type="primary" color="#173e3a" block round @click="emit('retry')">重新填写</van-button><button type="button" class="payment-secondary" @click="emit('close')">返回景区</button></div>
  </section>
</template>
