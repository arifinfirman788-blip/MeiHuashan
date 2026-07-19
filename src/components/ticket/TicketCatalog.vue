<script setup>
defineProps({
  ticketList: { type: Array, required: true }
})

const emit = defineEmits(['update-quantity'])

/* 数量变化由父页面统一保存，组件只负责展示和派发用户操作。 */
const updateQuantity = (ticket, quantity) => {
  emit('update-quantity', { id: ticket.id, quantity })
}
</script>

<template>
  <section class="tab-panel">
    <div class="section-heading"><h2>选择票型</h2><span>价格与库存状态</span></div>
    <div class="ticket-list">
      <div v-for="ticket in ticketList" :key="ticket.id" class="ticket-option">
        <div class="ticket-info"><strong>{{ ticket.name }}</strong><small>{{ ticket.description }}</small><span class="ticket-tags"><em>{{ ticket.available ? ticket.stockLabel : '暂不可售' }}</em><em v-for="tag in ticket.tags" :key="tag">{{ tag }}</em></span></div>
        <div class="ticket-purchase"><b>¥{{ ticket.price }}</b><van-stepper :model-value="ticket.quantity" :min="0" :max="8" theme="round" button-size="28px" :disabled="!ticket.available" @update:model-value="updateQuantity(ticket, $event)" /></div>
      </div>
    </div>
    <div class="ticket-selection-tip">可同时购买多种票型，游玩日期、入园时段和游客信息将在点击“立即预订”后填写。</div>
  </section>
</template>
