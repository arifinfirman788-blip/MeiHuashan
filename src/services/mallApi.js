import { request } from '@/services/request'

/* 黔云联创商城 V2 接口集中在这里，页面组件不直接拼接接口地址。 */
export const mallApi = {
  getMerchant(params = {}) {
    return request('/app/merchant/getMerchant', { params })
  },

  getResourcesByResourcesGroup(params = {}) {
    return request('/app/resources/getResourcesByResourcesGroup', { params })
  },

  getResourcesMoreInfo(params = {}) {
    return request('/app/resources/getResourcesMoreInfo', { params })
  },

  getResourcesStockAndPrice(params = {}) {
    return request('/app/resources/getResourcesStockAndPrice', { params })
  },

  createOrder(body) {
    return request('/app/order/createOrder', { method: 'POST', body })
  },

  wechatPayment(body) {
    return request('/wechat/pay/wechatPayment', { method: 'POST', body })
  },

  getOrderByNo(orderNo) {
    return request('/app/order/getOrderByNo', { params: { orderNo } })
  },

  getResourcesOrderVoucher(params = {}) {
    return request('/app/order/getResourcesOrderVoucher', { params })
  }
}
