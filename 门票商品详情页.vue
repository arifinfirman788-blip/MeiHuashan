<template>
  <Page class="ticket-detail-box">
    <!-- 商品主图 -->
    <section class="hero-card">
      <img class="hero-image" :src="state.heroImage" alt="梅花山景区山地风景" />
      <div class="hero-mask"></div>
      <div class="hero-actions">
        <button type="button" aria-label="返回" @click="handleBack"><van-icon name="arrow-left" size="24" /></button>
        <button type="button" aria-label="分享" @click="handleShare"><van-icon name="share-o" size="24" /></button>
      </div>
      <div class="hero-content">
        <p>⌖ 贵州 · 六盘水 · 梅花山景区</p>
        <h1>梅花山景区门票</h1>
        <span>{{ state.scenicIntro }}</span>
      </div>
    </section>

    <section class="visit-facts" aria-label="游客实用信息">
      <div class="visit-fact"><span class="visit-fact-icon"><van-icon name="clock-o" size="20" /></span><span class="visit-fact-content"><strong>{{ state.openingHours }}</strong><small>开放时间</small></span></div>
      <div class="visit-fact"><span class="visit-fact-icon"><van-icon name="guide-o" size="20" /></span><span class="visit-fact-content"><strong>{{ state.suggestedDuration }}</strong><small>建议游玩</small></span></div>
      <div class="visit-fact"><span class="visit-fact-icon"><van-icon name="location-o" size="20" /></span><span class="visit-fact-content"><strong>{{ state.scenicAddress }}</strong><small>景区地址</small></span></div>
    </section>

    <!-- 信息分类 -->
    <van-tabs v-model:active="state.activeTab" type="card" class="detail-tabs" color="#173e3a" title-active-color="#173e3a" @change="handleTabChange">
      <van-tab title="票型价格" name="ticket">
        <section class="tab-panel">
          <div class="section-heading"><h2>选择票型</h2><span>价格与库存状态</span></div>
          <div class="ticket-list">
            <div v-for="ticket in state.ticketList" :key="ticket.id" class="ticket-option">
              <div class="ticket-info"><strong>{{ ticket.name }}</strong><small>{{ ticket.description }}</small><span class="ticket-tags"><em>{{ ticket.available ? ticket.stockLabel : '暂不可售' }}</em><em v-for="tag in ticket.tags" :key="tag">{{ tag }}</em></span></div>
              <div class="ticket-purchase"><b>¥{{ ticket.price }}</b><van-stepper v-model="ticket.quantity" :min="0" :max="8" theme="round" button-size="28px" :disabled="!ticket.available" /></div>
            </div>
          </div>
          <div class="ticket-selection-tip">可同时购买多种票型，游玩日期、入园时段和游客信息将在点击“立即预订”后填写。</div>
        </section>
      </van-tab>
      <van-tab title="购票须知" name="notice">
        <section class="tab-panel">
          <div class="section-heading"><h2>购票须知</h2><span>下单前阅读</span></div>
          <van-cell-group inset class="notice-card">
            <van-cell title="核验方式" :value="state.checkType" />
            <van-cell title="实名制" :value="state.hasRealName ? '需要填写游客信息' : '按数量核验'" />
            <van-cell title="有效期" :value="state.validityPeriod" />
          </van-cell-group>
        </section>
      </van-tab>
    </van-tabs>

    <!-- 底部购买栏 -->
    <div class="bottom-bar">
      <div class="bottom-price"><span>共{{ totalQuantity }}张门票</span><strong>¥{{ totalPrice }}</strong></div>
      <van-button type="primary" color="#21b596" round @click="openBooking"><span>立即预订</span><van-icon name="arrow" size="18" /></van-button>
    </div>

    <!-- 预订信息弹层 -->
    <van-popup v-model:show="state.bookingVisible" position="bottom" round :style="{ maxHeight: '88%' }">
      <div class="booking-sheet">
        <div class="sheet-heading"><div><h2>填写预订信息</h2><p>已选{{ totalQuantity }}张门票</p></div><van-icon name="cross" size="20" color="#687773" @click="closeBooking" /></div>
        <div class="order-summary"><div v-for="ticket in selectedTickets" :key="ticket.id"><span>{{ ticket.name }} × {{ ticket.quantity }}</span><strong>¥{{ ticket.price * ticket.quantity }}</strong></div><div class="order-total"><span>订单金额</span><strong>¥{{ totalPrice }}</strong></div></div>
        <label>游玩日期</label>
        <div class="date-grid"><button v-for="date in state.dateList" :key="date.value" type="button" :class="{ selected: state.selectedDate === date.value }" @click="selectDate(date.value)"><span>{{ date.label }}</span><strong>{{ date.date }}</strong></button></div>
        <label>入园时段</label>
        <div class="time-grid"><button v-for="time in state.timeList" :key="time" type="button" :class="{ selected: state.selectedTime === time }" @click="selectTime(time)">{{ time }}</button></div>
        <section class="visitor-section contact-section">
          <div class="visitor-section-heading"><div><strong>联系人信息</strong><span>用于接收订单与出票通知</span></div><van-tag color="#f6e2e6" text-color="#c4576d" round>必填</van-tag></div>
          <div class="visitor-card contact-card">
            <van-field v-model="state.contactName" label="姓名" placeholder="请输入联系人姓名" clearable />
            <van-field v-model="state.contactPhone" label="手机号" type="tel" placeholder="请输入联系人手机号" maxlength="11" clearable />
          </div>
        </section>
        <section v-if="state.hasRealName" class="visitor-section">
          <div class="visitor-section-heading"><div><strong>游客信息</strong><span>需要填写{{ totalQuantity }}位游客</span></div><van-tag color="#f6e2e6" text-color="#c4576d" round>实名制</van-tag></div>
          <div v-for="(visitor, index) in state.visitorList" :key="index" class="visitor-card">
            <div class="visitor-card-heading"><strong>游客 {{ index + 1 }}</strong><span>{{ visitor.ticketName }}</span></div>
            <van-field v-model="visitor.name" label="姓名" placeholder="请输入真实姓名" clearable />
            <van-field :model-value="'身份证'" label="证件类型" readonly />
            <van-field v-model="visitor.idNumber" label="身份证号" placeholder="请输入18位身份证号" maxlength="18" clearable />
            <van-field v-model="visitor.phone" label="手机号" type="tel" placeholder="选填，游客手机号" maxlength="11" clearable />
          </div>
        </section>
        <p class="sheet-note">实名信息仅用于本次入园核验，支付成功后可在订单详情查看核销码。</p>
        <van-button type="primary" color="#21b596" block round @click="createOrder">提交订单 · ¥{{ totalPrice }}</van-button>
      </div>
    </van-popup>

    <section v-if="state.paymentPageVisible" class="payment-page">
      <div class="payment-page-header"><button type="button" aria-label="返回" @click="closePayment"><van-icon name="arrow-left" size="22" /></button><strong>支付结果</strong><span></span></div>
      <div class="payment-result"><div class="payment-mark">✓</div><h1>支付成功</h1><p>订单已提交，正在为你出票</p></div>
      <div class="payment-card"><div class="payment-amount"><span>实付金额</span><strong>¥{{ totalPrice }}</strong></div><div><span>支付方式</span><strong>微信支付</strong></div><div><span>订单编号</span><strong>{{ state.orderNo }}</strong></div><div><span>游玩日期</span><strong>{{ selectedDateLabel }}</strong></div><div><span>已购票型</span><strong>{{ selectedTicketSummary }}</strong></div></div>
      <div class="payment-actions"><van-button type="primary" color="#173e3a" block round @click="viewOrder">查看订单</van-button><button type="button" class="payment-secondary" @click="closePayment">返回景区</button></div>
    </section>
  </Page>
</template>

<!-- 梅花山景区商品详情页 -->
<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
import { showToast } from 'vant'
import Page from '@/components/Page.vue'

/*------------------------------------------------变量----------------------------------------------------*/
const state = reactive({
  activeTab: 'ticket',
  bookingVisible: false,
  paymentPageVisible: false,
  orderNo: '',
  heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=82',
  checkType: '实名核验',
  hasRealName: true,
  validityPeriod: '所选日期当天有效',
  scenicIntro: '六盘水梅花山拥有高山森林、云海和清凉气候，游客可按所选日期进入景区，体验山地自然风光与度假休闲时光。',
  openingHours: '08:30–17:30',
  suggestedDuration: '3–5小时',
  scenicAddress: '六盘水市水城区',
  orderLocation: { longitude: 104.82, latitude: 26.59 },
  selectedDate: 'today',
  selectedTime: '08:30–12:00',
  contactName: '',
  contactPhone: '',
  visitorList: [],
  ticketList: [
    { id: 'adult', name: '成人票', price: 80, quantity: 1, description: '适用于 18–59 周岁游客', available: true, stockLabel: '库存充足', tags: ['电子票', '实名入园', '含游客意外险'] },
    { id: 'child', name: '儿童票', price: 40, quantity: 0, description: '适用于 6–17 周岁游客', available: true, stockLabel: '库存充足', tags: ['电子票', '不含保险'] },
    { id: 'student', name: '学生票', price: 60, quantity: 0, description: '凭有效学生证件入园', available: true, stockLabel: '库存充足', tags: ['电子票', '不含保险'] }
  ],
  dateList: [
    { label: '今天', value: 'today', date: '06/28' },
    { label: '明天', value: 'tomorrow', date: '06/29' },
    { label: '周日', value: 'sunday', date: '06/30' },
    { label: '周一', value: 'monday', date: '07/01' }
  ],
  timeList: ['08:30–12:00', '12:00–17:30']
})

const selectedTickets = computed(() => state.ticketList.filter(ticket => ticket.quantity > 0))
const totalQuantity = computed(() => selectedTickets.value.reduce((total, ticket) => total + ticket.quantity, 0))
const totalPrice = computed(() => selectedTickets.value.reduce((total, ticket) => total + ticket.price * ticket.quantity, 0))
const selectedDateLabel = computed(() => {
  const dateItem = state.dateList.find(date => date.value === state.selectedDate)
  return dateItem ? `${dateItem.label} ${dateItem.date}` : state.selectedDate
})
const selectedTicketSummary = computed(() => selectedTickets.value.map(ticket => `${ticket.name} × ${ticket.quantity}`).join('、'))

const createVisitor = ticketName => ({ name: '', cardTypeId: 'ID', idNumber: '', phone: '', ticketName })

/*----------------------------------------------事件函数--------------------------------------------------*/
/** 获取数据 */
const getData = () => {
  state.activeTab = 'ticket'
}

/** 切换信息分类 */
const handleTabChange = tabName => {
  state.activeTab = tabName
}

/** 选择日期 */
const selectDate = date => {
  state.selectedDate = date
}

/** 选择时段 */
const selectTime = time => {
  state.selectedTime = time
}

/** 同步游客信息 */
const syncVisitors = () => {
  const currentVisitors = state.visitorList
  const nextVisitors = []
  selectedTickets.value.forEach(ticket => {
    for (let index = 0; index < ticket.quantity; index += 1) {
      const currentVisitor = currentVisitors[nextVisitors.length]
      nextVisitors.push(currentVisitor || createVisitor(ticket.name))
      nextVisitors[nextVisitors.length - 1].cardTypeId = 'ID'
      nextVisitors[nextVisitors.length - 1].ticketName = ticket.name
    }
  })
  state.visitorList.splice(0, state.visitorList.length, ...nextVisitors)
}

/** 打开预订弹层 */
const openBooking = () => {
  if (!totalQuantity.value) {
    showToast('请先选择票型和数量')
    state.activeTab = 'ticket'
    return
  }
  syncVisitors()
  state.bookingVisible = true
}

/** 关闭预订弹层 */
const closeBooking = () => {
  state.bookingVisible = false
}

/** 提交订单 */
const createOrder = () => {
  if (!state.contactName.trim() || !state.contactPhone.trim()) {
    showToast('请填写联系人姓名和手机号')
    return
  }

  const hasInvalidVisitor = state.hasRealName && state.visitorList.some(visitor => {
    const idNumber = visitor.idNumber.trim()
    return !visitor.name.trim() || !/^\d{17}[\dXx]$/.test(idNumber)
  })

  if (hasInvalidVisitor) {
    showToast('请填写完整且正确的游客信息')
    return
  }

  closeBooking()
  state.orderNo = `MH${Date.now()}`
  state.paymentPageVisible = true
}

/** 返回景区首页 */
const handleBack = () => {
  showToast('返回景区首页')
}

/** 分享商品 */
const handleShare = () => {
  showToast('已打开分享面板')
}

/** 关闭支付结果页 */
const closePayment = () => {
  state.paymentPageVisible = false
}

/** 查看订单 */
const viewOrder = () => {
  showToast('订单详情待接入')
}

/*----------------------------------------------生命周期--------------------------------------------------*/
onMounted(() => {
  getData()
})

watch(() => state.ticketList.map(ticket => ticket.quantity), syncVisitors, { deep: true })
</script>

<style lang="scss" scoped>
.ticket-detail-box {
  min-height: 100vh;
  padding: 8px 8px 118px;
  background: #ffffff;
  color: #1f2e2b;
  --font-body: "PingFang SC", "苹方-简", "PingFang TC", "苹方-繁", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
  --font-number: "D-DIN", "DIN Alternate", "DIN Condensed", "Avenir Next Condensed", "Helvetica Neue", sans-serif;
  font-family: var(--font-body);
  font-synthesis: none;
  -webkit-font-smoothing: antialiased;

  .hero-card {
    position: relative;
    height: 350px;
    overflow: hidden;
    border-radius: 28px 28px 34px 34px;
    background: #3b6a5e;
  }

  .hero-image,
  .hero-mask {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .hero-image {
    object-fit: cover;
  }

  .hero-mask {
    background: linear-gradient(180deg, rgba(23, 62, 58, .22), rgba(23, 62, 58, .04) 48%, rgba(23, 62, 58, .74));
  }

  .hero-actions {
    position: absolute;
    z-index: 2;
    top: 16px;
    right: 22px;
    left: 22px;
    display: flex;
    justify-content: space-between;
    padding-top: env(safe-area-inset-top);

    button {
      display: grid;
      place-items: center;
      width: 54px;
      height: 54px;
      border: 1px solid rgba(255, 255, 255, .32);
      border-radius: 50%;
      color: #ffffff;
      background: rgba(23, 62, 58, .28);
      backdrop-filter: blur(14px);
    }
  }

  .hero-content {
    position: absolute;
    z-index: 2;
    right: 24px;
    bottom: 28px;
    left: 24px;
    color: #ffffff;

    p {
      margin: 0 0 8px;
      color: rgba(255, 255, 255, .84);
      font-size: 13px;
    }

    h1 {
      margin: 0;
      font-size: 30px;
      font-weight: 500;
      line-height: 1.2;
      letter-spacing: -.04em;
    }

    span {
      display: block;
      margin-top: 9px;
      color: rgba(255, 255, 255, .7);
      font-size: 12px;
      line-height: 1.55;
    }
  }

  .visit-facts {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin: 18px 8px 0;

    .visit-fact {
      display: flex;
      align-items: center;
      min-width: 0;
      gap: 7px;
    }

    .visit-fact-icon {
      display: grid;
      flex: 0 0 42px;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      color: #314541;
      background: #f2f4f2;
    }

    .visit-fact-content {
      display: grid;
      min-width: 0;
      gap: 3px;
    }

    strong,
    small {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    strong {
      color: #1f2e2b;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.25;
    }

    small {
      color: #687773;
      font-size: 10px;
      line-height: 1.3;
      white-space: nowrap;
    }
  }

  .detail-tabs {
    margin-top: 20px;

    :deep(.van-tabs__wrap) {
      height: 52px;
    }

    :deep(.van-tabs__nav--card) {
      height: 48px;
      margin: 0 8px;
      padding: 0;
      border: 0;
      border-radius: 28px;
      background: #f4f5f4;
    }

    :deep(.van-tab) {
      margin: 4px;
      border: 1px solid transparent;
      border-radius: 24px;
      color: #687773;
      font-size: 14px;
    }

    :deep(.van-tab--active) {
      border-color: #1f2e2b;
      color: #1f2e2b;
      background: #ffffff;
    }

    :deep(.van-tabs__line) {
      display: none;
    }
  }

  .tab-panel {
    padding: 22px 16px 12px;
  }

  .section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;

    h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 500;
      line-height: 1.3;
      letter-spacing: -.03em;
    }

    span {
      color: #687773;
      font-size: 11px;
    }
  }

  .sub-heading {
    margin-top: 26px;

    h2 {
      font-size: 18px;
    }
  }

  .intro-copy,
  .field-note,
  .sheet-note {
    margin: 0;
    color: #687773;
    font-size: 14px;
    line-height: 1.72;
  }

  .info-card,
  .stock-card {
    display: grid;
    gap: 1px;
    overflow: hidden;
    border-radius: 14px;
    background: #dce8e1;
  }

  .info-card div,
  .stock-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 15px;
    background: #ffffff;

    span,
    small {
      color: #687773;
      font-size: 12px;
    }

    strong {
      font-size: 13px;
      font-weight: 500;
    }
  }

  .stock-card {
    display: grid;

    strong {
      color: #c4576d;
    }
  }

  .ticket-list {
    display: grid;
    gap: 10px;
  }

  .ticket-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 72px;
    padding: 12px 14px;
    border: 1px solid #dce8e1;
    border-radius: 14px;
    color: #687773;
    background: #ffffff;
    text-align: left;

    strong,
    small {
      display: block;
    }

    strong {
      color: #1f2e2b;
      font-size: 15px;
      font-weight: 600;
    }

    small {
      margin-top: 4px;
      font-size: 11px;
    }

    b {
      color: #c4576d;
      font-size: 17px;
    }

    em {
      margin-left: 5px;
      padding: 3px 6px;
      border-radius: 999px;
      color: #3b6a5e;
      background: #dcebe3;
      font-size: 10px;
      font-style: normal;
    }

    .ticket-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 6px;

      em {
        margin-left: 0;
      }
    }
  }

  .ticket-info {
    min-width: 0;
  }

  .ticket-purchase {
    display: grid;
    justify-items: end;
    gap: 9px;
    margin-left: 10px;

    b {
      font-family: var(--font-number);
    }

    :deep(.van-stepper) {
      gap: 8px;
    }
  }

  .ticket-selection-tip {
    margin-top: 14px;
    color: #687773;
    font-size: 11px;
    line-height: 1.6;
  }

  .order-summary {
    display: grid;
    gap: 1px;
    margin-top: 16px;
    overflow: hidden;
    border-radius: 13px;
    background: #dce8e1;

    > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 13px 14px;
      color: #687773;
      background: #ffffff;
      font-size: 13px;
    }

    strong {
      color: #1f2e2b;
      font-family: var(--font-number);
    }

    .order-total {
      color: #1f2e2b;
      font-weight: 600;

      strong {
        color: #c4576d;
        font-size: 18px;
      }
    }
  }

  .purchase-card {
    margin-top: 18px;
    padding: 15px;
    border: 1px solid #dce8e1;
    border-radius: 16px;
    background: #f2f6f2;

    .section-heading {
      margin-bottom: 12px;
    }

    .sub-heading {
      margin-top: 20px;
    }

    .quantity-row {
      margin-top: 18px;
    }
  }

  .ticket-insurance {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 10px;
    margin-top: 12px;
    padding: 12px;
    border: 1px solid #e2c5cc;
    border-radius: 12px;
    background: #f6e2e6;

    span {
      color: #687773;
      font-size: 12px;
    }

    strong {
      color: #c4576d;
      font-size: 12px;
    }

    small {
      grid-column: 1 / -1;
      color: #687773;
      font-size: 11px;
      line-height: 1.5;
    }
  }

  .availability-note {
    margin: 12px 0 0;
    color: #687773;
    font-size: 11px;
    line-height: 1.5;
  }

  .field-note {
    margin-top: 10px;
    color: #687773;
    font-size: 11px;
  }

  .notice-card {
    overflow: hidden;
  }

  .bottom-bar {
    position: fixed;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 12px;
    right: auto;
    bottom: max(12px, env(safe-area-inset-bottom));
    left: 50%;
    width: min(calc(100% - 24px), 428px);
    margin: 0;
    padding: 10px 10px 10px 18px;
    border: 1px solid #e7efeb;
    border-radius: 30px;
    background: rgba(255, 255, 255, .98);
    box-shadow: 0 10px 30px rgba(23, 62, 58, .18);
    backdrop-filter: blur(16px);
    transform: translateX(-50%);
  }

  .bottom-price {
    flex: 1;

    > span,
    > strong {
      display: block;
    }

    strong > span,
    strong > small {
      display: inline;
    }

    span {
      color: #687773;
      font-size: 12px;
    }

    strong {
      margin-top: 3px;
      color: #1f2e2b;
      font-family: var(--font-number);
      font-size: 30px;
      font-weight: 700;
      line-height: 1;
    }

    small {
      margin-left: 2px;
      font-size: 11px;
    }
  }

  .booking-sheet {
    padding: 20px;
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
    font-family: var(--font-body);

    h2 {
      margin: 0;
      font-size: 21px;
      font-weight: 500;
    }

    p {
      margin: 5px 0 0;
      color: #687773;
      font-size: 12px;
    }

    label {
      display: block;
      margin: 20px 0 9px;
      font-size: 13px;
      font-weight: 600;
    }
  }

  .sheet-heading,
  .selected-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .selected-summary {
    margin-top: 18px;
    padding: 13px 14px;
    border: 1px solid #e2c5cc;
    border-radius: 13px;
    background: #f6e2e6;

    span {
      color: #687773;
      font-size: 12px;
    }

    strong {
      color: #c4576d;
      font-size: 14px;
    }
  }

  .date-grid,
  .time-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;

    button {
      min-height: 60px;
      border: 1px solid #dce8e1;
      border-radius: 11px;
      color: #687773;
      background: #ffffff;

      &.selected {
        border-color: #c4576d;
        color: #c4576d;
        background: #f6e2e6;
      }

      span,
      strong {
        display: block;
      }

      span {
        font-size: 11px;
      }

      strong {
        margin-top: 4px;
        color: #1f2e2b;
        font-size: 13px;
      }
    }
  }

  .time-grid {
    grid-template-columns: 1fr 1fr;

    button {
      min-height: 44px;
      color: #1f2e2b;
      font-size: 12px;
    }
  }

  .quantity-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 48px;
    padding: 0 13px;
    border: 1px solid #dce8e1;
    border-radius: 11px;
    background: #ffffff;

    > span {
      color: #687773;
      font-size: 13px;
    }
  }

  .visitor-section {
    margin-top: 22px;
  }

  .visitor-section-heading,
  .visitor-card-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .visitor-section-heading {
    margin-bottom: 10px;

    div {
      display: grid;
      gap: 4px;
    }

    strong {
      font-size: 15px;
    }

    span {
      color: #687773;
      font-size: 11px;
    }
  }

  .visitor-card {
    margin-top: 10px;
    padding: 4px 14px 6px;
    border: 1px solid #dce8e1;
    border-radius: 14px;
    background: #ffffff;
  }

  .visitor-card-heading {
    min-height: 34px;
    border-bottom: 1px solid #eef3f0;

    strong {
      font-size: 13px;
    }

    span {
      color: #3b6a5e;
      font-size: 11px;
    }
  }

  :deep(.visitor-card .van-cell) {
    padding: 12px 0;
    background: transparent;
  }

  :deep(.visitor-card .van-cell:not(:last-child)::after) {
    right: 0;
    left: 0;
  }

  :deep(.visitor-card .van-field__label) {
    width: 62px;
    color: #687773;
  }

  :deep(.visitor-card .van-field__control) {
    color: #1f2e2b;
    font-size: 13px;
  }

  .sheet-note {
    margin: 14px 0;
    font-size: 11px;
  }

  .payment-page {
    position: fixed;
    z-index: 3000;
    inset: 0;
    overflow: auto;
    padding: calc(16px + env(safe-area-inset-top)) 20px calc(24px + env(safe-area-inset-bottom));
    color: #1f2e2b;
    background: #f2f6f2;
  }

  .payment-page-header {
    display: grid;
    grid-template-columns: 40px 1fr 40px;
    align-items: center;
    min-height: 44px;
    text-align: center;

    button {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border: 0;
      border-radius: 50%;
      color: #1f2e2b;
      background: transparent;
    }

    strong {
      font-size: 17px;
    }
  }

  .payment-result {
    display: grid;
    justify-items: center;
    padding: 42px 0 30px;
    text-align: center;

    .payment-mark {
      display: grid;
      place-items: center;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      color: #ffffff;
      background: #21b596;
      font-size: 38px;
      font-weight: 600;
    }

    h1 {
      margin: 18px 0 7px;
      font-size: 25px;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: #687773;
      font-size: 13px;
    }
  }

  .payment-card {
    display: grid;
    gap: 1px;
    overflow: hidden;
    border-radius: 16px;
    background: #dce8e1;

    > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      min-height: 52px;
      padding: 0 16px;
      background: #ffffff;
      font-size: 13px;
    }

    span {
      color: #687773;
    }

    strong {
      max-width: 68%;
      overflow: hidden;
      color: #1f2e2b;
      font-size: 13px;
      text-align: right;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .payment-amount {
      min-height: 72px;

      strong {
        color: #c4576d;
        font-family: var(--font-number);
        font-size: 24px;
      }
    }
  }

  .payment-actions {
    display: grid;
    gap: 12px;
    margin-top: 28px;
  }

  .payment-secondary {
    min-height: 44px;
    border: 0;
    color: #687773;
    background: transparent;
    font-size: 14px;
  }

  @media (min-width: 700px) {
    margin: 24px auto;
    border-radius: 22px;

    .bottom-bar {
      bottom: 24px;
      border-radius: 16px;
    }
  }

  :deep(.bottom-bar .van-button) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex: 0 0 52%;
    height: 56px;
    border: 0;
    border-radius: 999px;
    font-size: 16px;
    font-weight: 600;
  }

  :deep(.bottom-bar .van-button__content) {
    gap: 12px;
  }

  :deep(.bottom-bar .van-icon) {
    font-family: var(--font-number);
  }
}
</style>
