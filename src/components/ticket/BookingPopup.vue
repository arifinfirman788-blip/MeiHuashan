<script setup>
defineProps({
  show: { type: Boolean, required: true },
  totalQuantity: { type: Number, required: true },
  selectedTickets: { type: Array, required: true },
  totalPrice: { type: Number, required: true },
  dateList: { type: Array, required: true },
  selectedDate: { type: String, required: true },
  timeList: { type: Array, required: true },
  selectedTime: { type: String, required: true },
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  hasRealName: { type: Boolean, required: true },
  visitorList: { type: Array, required: true },
  loading: { type: Boolean, required: true }
})

const emit = defineEmits([
  'update:show',
  'update:contactName',
  'update:contactPhone',
  'select-date',
  'select-time',
  'update-visitor',
  'submit'
])

const updateVisitor = (index, field, value) => {
  emit('update-visitor', { index, field, value })
}
</script>

<template>
  <van-popup :show="show" position="bottom" round :style="{ maxHeight: '88%' }" @update:show="emit('update:show', $event)">
    <div class="booking-sheet">
      <div class="sheet-heading"><div><h2>填写预订信息</h2><p>已选{{ totalQuantity }}张门票</p></div><van-icon name="cross" size="20" color="#687773" @click="emit('update:show', false)" /></div>
      <div class="order-summary"><div v-for="ticket in selectedTickets" :key="ticket.id"><span>{{ ticket.name }} × {{ ticket.quantity }}</span><strong>¥{{ ticket.price * ticket.quantity }}</strong></div><div class="order-total"><span>订单金额</span><strong>¥{{ totalPrice }}</strong></div></div>
      <label>游玩日期</label>
      <div class="date-grid"><button v-for="date in dateList" :key="date.value" type="button" :class="{ selected: selectedDate === date.value }" @click="emit('select-date', date.value)"><span>{{ date.label }}</span><strong>{{ date.date }}</strong></button></div>
      <label>入园时段</label>
      <div class="time-grid"><button v-for="time in timeList" :key="time" type="button" :class="{ selected: selectedTime === time }" @click="emit('select-time', time)">{{ time }}</button></div>
      <section class="visitor-section contact-section">
        <div class="visitor-section-heading"><div><strong>联系人信息</strong><span>用于接收订单与出票通知</span></div><van-tag color="#f6e2e6" text-color="#c4576d" round>必填</van-tag></div>
        <div class="visitor-card contact-card">
          <van-field :model-value="contactName" label="姓名" placeholder="请输入联系人姓名" clearable @update:model-value="emit('update:contactName', $event)" />
          <van-field :model-value="contactPhone" label="手机号" type="tel" placeholder="请输入联系人手机号" maxlength="11" clearable @update:model-value="emit('update:contactPhone', $event)" />
        </div>
      </section>
      <section v-if="hasRealName" class="visitor-section">
        <div class="visitor-section-heading"><div><strong>游客信息</strong><span>需要填写{{ totalQuantity }}位游客</span></div><van-tag color="#f6e2e6" text-color="#c4576d" round>实名制</van-tag></div>
        <div v-for="(visitor, index) in visitorList" :key="index" class="visitor-card">
          <div class="visitor-card-heading"><strong>游客 {{ index + 1 }}</strong><span>{{ visitor.ticketName }}</span></div>
          <van-field :model-value="visitor.name" label="姓名" placeholder="请输入真实姓名" clearable @update:model-value="updateVisitor(index, 'name', $event)" />
          <van-field model-value="身份证" label="证件类型" readonly />
          <van-field :model-value="visitor.idNumber" label="身份证号" placeholder="请输入18位身份证号" maxlength="18" clearable @update:model-value="updateVisitor(index, 'idNumber', $event)" />
          <van-field :model-value="visitor.phone" label="手机号" type="tel" placeholder="选填，游客手机号" maxlength="11" clearable @update:model-value="updateVisitor(index, 'phone', $event)" />
        </div>
      </section>
      <p class="sheet-note">实名信息仅用于本次入园核验，支付成功后可在订单详情查看核销码。</p>
      <van-button type="primary" color="#21b596" block round :loading="loading" @click="emit('submit')">提交订单 · ¥{{ totalPrice }}</van-button>
    </div>
  </van-popup>
</template>
