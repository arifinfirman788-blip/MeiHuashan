<template>
  <Page class="ticket-detail-box">
    <HeroSection :hero-image="state.heroImage" :scenic-intro="state.scenicIntro" @back="handleBack" @share="handleShare" />
    <VisitFacts :opening-hours="state.openingHours" :suggested-duration="state.suggestedDuration" :scenic-address="state.scenicAddress" />

    <!-- 信息分类 -->
    <van-tabs v-model:active="state.activeTab" type="card" class="detail-tabs" color="#173e3a" title-active-color="#173e3a" @change="handleTabChange">
      <van-tab title="票型价格" name="ticket">
        <TicketCatalog :ticket-list="state.ticketList" @update-quantity="updateTicketQuantity" />
      </van-tab>
      <van-tab title="购票须知" name="notice">
        <NoticePanel :check-type="state.checkType" :has-real-name="state.hasRealName" :validity-period="state.validityPeriod" />
      </van-tab>
    </van-tabs>

    <!-- 底部购买栏 -->
    <div class="bottom-bar">
      <div class="bottom-price"><span>共{{ totalQuantity }}张门票</span><strong>¥{{ totalPrice }}</strong></div>
      <van-button type="primary" color="#21b596" round @click="openBooking"><span>立即预订</span><van-icon name="arrow" size="18" /></van-button>
    </div>

    <BookingPopup
      :show="state.bookingVisible"
      :total-quantity="totalQuantity"
      :selected-tickets="selectedTickets"
      :total-price="totalPrice"
      :date-list="state.dateList"
      :selected-date="state.selectedDate"
      :time-list="state.timeList"
      :selected-time="state.selectedTime"
      :contact-name="state.contactName"
      :contact-phone="state.contactPhone"
      :has-real-name="state.hasRealName"
      :visitor-list="state.visitorList"
      :loading="state.loading"
      @update:show="state.bookingVisible = $event"
      @update:contact-name="state.contactName = $event"
      @update:contact-phone="state.contactPhone = $event"
      @select-date="selectDate"
      @select-time="selectTime"
      @update-visitor="updateVisitor"
      @submit="createOrder"
    />

    <PaymentResultPage
      v-if="state.paymentPageVisible"
      :status="state.paymentStatus"
      :amount="paymentAmount"
      :order-no="state.orderNo"
      :order-status-label="state.orderStatusLabel"
      :date-label="selectedDateLabel"
      :ticket-summary="selectedTicketSummary"
      :title="paymentTitle"
      :description="paymentDescription"
      @close="closePayment"
      @retry="retryPayment"
      @view-order="viewOrder"
    />
  </Page>
</template>

<!-- 梅花山景区商品详情页 -->
<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
import { showToast } from 'vant'
import Page from '@/components/Page.vue'
import { isMallApiConfigured, runtimeConfig } from '@/config/env'
import { mallApi } from '@/services/mallApi'
import { requestWechatPayment } from '@/services/wechatPay'
import BookingPopup from '@/components/ticket/BookingPopup.vue'
import HeroSection from '@/components/ticket/HeroSection.vue'
import NoticePanel from '@/components/ticket/NoticePanel.vue'
import PaymentResultPage from '@/pages/PaymentResultPage.vue'
import TicketCatalog from '@/components/ticket/TicketCatalog.vue'
import VisitFacts from '@/components/ticket/VisitFacts.vue'

/*------------------------------------------------变量----------------------------------------------------*/
const state = reactive({
  activeTab: 'ticket',
  bookingVisible: false,
  paymentPageVisible: false,
  loading: false,
  orderNo: '',
  orderId: '',
  orderStatus: '',
  orderStatusLabel: '订单处理中',
  paymentStatus: 'paying',
  paymentAmount: 0,
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
const paymentAmount = computed(() => state.paymentAmount || totalPrice.value)
const paymentTitle = computed(() => ({
  paying: '支付处理中',
  success: '支付成功',
  failed: '支付失败'
}[state.paymentStatus] || '订单处理中'))
const paymentDescription = computed(() => ({
  paying: '正在提交订单并确认微信支付结果，请稍候',
  success: '订单已支付，正在为你出票',
  failed: '订单未完成支付，请检查订单状态后重试'
}[state.paymentStatus] || '正在确认订单状态'))

const createVisitor = ticketName => ({ name: '', cardTypeId: 'ID', idNumber: '', phone: '', ticketName })

/*----------------------------------------------事件函数--------------------------------------------------*/
/* 接口返回可能包裹 data，这里统一拆包，避免页面到处判断返回结构。 */
const unwrapData = response => response?.data ?? response ?? {}

/* 将接口票型字段转换为页面字段，真实字段差异只需要在这里调整。 */
const normalizeTicket = (source, index) => {
  const ticket = source || {}
  const tags = ticket.tags || ticket.labels || []
  const tagList = Array.isArray(tags) ? tags.map(tag => typeof tag === 'string' ? tag : tag.name).filter(Boolean) : []
  const hasInsurance = ticket.hasInsurance ?? ticket.insurance ?? false
  return {
    id: ticket.id || ticket.resourcesSkuId || `ticket-${index}`,
    resourcesId: ticket.resourcesId || ticket.resourceId || runtimeConfig.resourcesId,
    resourcesSkuId: ticket.resourcesSkuId || ticket.id || `ticket-${index}`,
    name: ticket.skuName || ticket.name || '门票',
    price: Number(ticket.price ?? ticket.salePrice ?? 0),
    quantity: 0,
    description: ticket.ageString || ticket.description || '请以票型适用规则为准',
    available: !(ticket.isStopSell || ticket.stockStatus === 'SOLD_OUT'),
    stockLabel: ticket.stockLabel || (ticket.stockStatus === 'SOLD_OUT' ? '已售罄' : '库存充足'),
    tags: [...tagList, hasInsurance ? '含保险' : '不含保险']
  }
}

/* 将景区和资源详情接口结果映射到当前页面。 */
const applyResourceData = (merchantResponse, resourceResponse) => {
  const merchant = unwrapData(merchantResponse)
  const resource = unwrapData(resourceResponse)
  state.heroImage = resource.image || resource.images?.[0] || merchant.image || state.heroImage
  state.scenicIntro = resource.intro || resource.imageTextIntro || merchant.intro || state.scenicIntro
  state.scenicAddress = merchant.address || state.scenicAddress
  state.openingHours = merchant.shopHours || state.openingHours
  state.checkType = resource.checkType || state.checkType
  state.hasRealName = resource.hasRealName ?? state.hasRealName
  state.validityPeriod = resource.validityPeriod || state.validityPeriod

  const sourceTickets = resource.resourcesSkuList || resource.skuList || resource.data || []
  if (sourceTickets.length) {
    state.ticketList.splice(0, state.ticketList.length, ...sourceTickets.map(normalizeTicket))
    state.ticketList[0].quantity = 1
  }
}

/* 获取景区和票型数据；没有配置接口时保留静态预览数据。 */
const getData = async () => {
  state.activeTab = 'ticket'
  if (!isMallApiConfigured()) return

  try {
    const [merchant, resource] = await Promise.all([
      mallApi.getMerchant({ merchantId: runtimeConfig.merchantId }),
      mallApi.getResourcesMoreInfo({ resourcesId: runtimeConfig.resourcesId })
    ])
    applyResourceData(merchant, resource)
  } catch (error) {
    showToast(error.message || '景区数据加载失败，当前使用预览数据')
  }
}

/** 切换信息分类 */
const handleTabChange = tabName => {
  state.activeTab = tabName
}

/** 更新票型购买数量 */
const updateTicketQuantity = ({ id, quantity }) => {
  const ticket = state.ticketList.find(item => item.id === id)
  if (ticket) ticket.quantity = quantity
}

/** 选择日期 */
const selectDate = date => {
  state.selectedDate = date
}

/** 选择时段 */
const selectTime = time => {
  state.selectedTime = time
}

/** 更新游客或联系人表单字段 */
const updateVisitor = ({ index, field, value }) => {
  if (state.visitorList[index]) state.visitorList[index][field] = value
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

/* 取得微信用户身份；正式小程序应在登录流程中写入 openid。 */
const getWechatOpenid = () => {
  if (globalThis.wx?.getStorageSync) return globalThis.wx.getStorageSync('openid') || ''
  return runtimeConfig.openid
}

/* 组装创建订单请求，页面 quantity 在接口中必须转换为 details[].number。 */
const buildOrderPayload = () => ({
  contactName: state.contactName.trim(),
  contactTel: state.contactPhone.trim(),
  longitude: state.orderLocation.longitude,
  latitude: state.orderLocation.latitude,
  details: selectedTickets.value.map(ticket => ({
    resourcesId: ticket.resourcesId || runtimeConfig.resourcesId,
    resourcesSkuId: ticket.resourcesSkuId || ticket.id,
    number: ticket.quantity,
    playDate: state.selectedDate,
    ...(state.selectedTime ? { stockTime: state.selectedTime } : {}),
    ...(state.hasRealName ? {
      travellers: state.visitorList
        .filter(visitor => visitor.ticketName === ticket.name)
        .map(visitor => ({
          name: visitor.name.trim(),
          idCard: visitor.idNumber.trim(),
          phone: visitor.phone.trim(),
          cardTypeId: 'ID'
        }))
    } : {})
  }))
})

/* 将 B 公司订单状态归一化为页面状态；具体枚举值待黔云联创确认后集中替换。 */
const resolveOrderStatus = order => {
  const status = String(order?.orderStatus || '').toUpperCase()
  if (['ISSUED', '出票成功', '已出票'].some(value => status.includes(value))) return 'issued'
  if (['PAID', 'PAY_SUCCESS', '支付成功', '已支付', '出票中'].some(value => status.includes(value))) return 'success'
  if (['FAIL', 'FAILED', '支付失败', 'PAY_FAIL'].some(value => status.includes(value))) return 'failed'
  if (['CANCEL', 'CLOSED', '已取消', '已关闭'].some(value => status.includes(value))) return 'failed'
  return 'paying'
}

/* 支付后重新查询订单，避免把 wx.requestPayment 成功误判成出票成功。 */
const refreshOrderStatus = async () => {
  const order = unwrapData(await mallApi.getOrderByNo(state.orderNo))
  state.orderStatus = order.orderStatus || ''
  const normalizedStatus = resolveOrderStatus(order)
  state.paymentStatus = normalizedStatus === 'failed' ? 'failed' : normalizedStatus === 'paying' ? 'paying' : 'success'
  state.orderStatusLabel = normalizedStatus === 'issued' ? '支付成功，已出票' : normalizedStatus === 'success' ? '支付成功，出票中' : normalizedStatus === 'failed' ? '支付失败' : '订单状态确认中'
  state.paymentAmount = Number(order.payAmount ?? order.totalAmount ?? state.paymentAmount)
  return order
}

/** 提交订单并调用微信支付 */
const createOrder = async () => {
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
  state.loading = true
  state.paymentStatus = 'paying'
  state.orderStatusLabel = '订单创建中'
  state.paymentAmount = totalPrice.value
  state.paymentPageVisible = true

  if (!isMallApiConfigured()) {
    state.orderNo = `MH${Date.now()}`
    state.orderStatusLabel = '支付成功，出票中（演示）'
    state.paymentStatus = 'success'
    state.loading = false
    return
  }

  try {
    const order = unwrapData(await mallApi.createOrder(buildOrderPayload()))
    state.orderNo = order.orderNo || order.mchOrderNo || ''
    state.orderId = order.orderId || ''
    state.paymentAmount = Number(order.payAmount ?? order.totalAmount ?? totalPrice.value)

    if (!state.orderNo) throw new Error('创建订单未返回订单号')
    if (Number(state.paymentAmount) === 0 || order.paySuccess === true) {
      await refreshOrderStatus()
      return
    }

    const openid = getWechatOpenid()
    if (!openid || !runtimeConfig.appId) throw new Error('缺少微信登录信息，请先完成小程序登录')
    const payment = unwrapData(await mallApi.wechatPayment({
      mchOrderNo: state.orderNo,
      openid,
      appId: runtimeConfig.appId
    }))
    if (!payment.paySuccess) await requestWechatPayment(payment.payInfo)
    await refreshOrderStatus()
  } catch (error) {
    state.paymentStatus = 'failed'
    state.orderStatusLabel = '支付失败'
    showToast(error.message || '订单提交失败，请稍后重试')
  } finally {
    state.loading = false
  }
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

/** 支付失败后返回预订弹层，保留已经填写的信息。 */
const retryPayment = () => {
  state.paymentPageVisible = false
  state.bookingVisible = true
}

/** 查看订单 */
const viewOrder = async () => {
  if (!isMallApiConfigured()) {
    showToast('订单详情接口待接入')
    return
  }

  try {
    await refreshOrderStatus()
    showToast(`订单状态：${state.orderStatusLabel}`)
  } catch (error) {
    showToast(error.message || '订单查询失败')
  }
}

/*----------------------------------------------生命周期--------------------------------------------------*/
onMounted(() => {
  getData()
})

watch(() => state.ticketList.map(ticket => ticket.quantity), syncVisitors, { deep: true })
</script>

<style lang="scss">
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

    .van-tabs__wrap {
      height: 52px;
    }

    .van-tabs__nav--card {
      height: 48px;
      margin: 0 8px;
      padding: 0;
      border: 0;
      border-radius: 28px;
      background: #f4f5f4;
    }

    .van-tab {
      margin: 4px;
      border: 1px solid transparent;
      border-radius: 24px;
      color: #687773;
      font-size: 14px;
    }

    .van-tab--active {
      border-color: #1f2e2b;
      color: #1f2e2b;
      background: #ffffff;
    }

    .van-tabs__line {
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

    .van-stepper {
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

  .visitor-card .van-cell {
    padding: 12px 0;
    background: transparent;
  }

  .visitor-card .van-cell:not(:last-child)::after {
    right: 0;
    left: 0;
  }

  .visitor-card .van-field__label {
    width: 62px;
    color: #687773;
  }

  .visitor-card .van-field__control {
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

      &.is-paying {
        background: #cba15a;
      }

      &.is-failed {
        background: #c4576d;
      }
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

  .bottom-bar .van-button {
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

  .bottom-bar .van-button__content {
    gap: 12px;
  }

  .bottom-bar .van-icon {
    font-family: var(--font-number);
  }
}
</style>
