/*
 * 调用微信小程序原生支付。H5 预览环境没有 wx 对象，因此只返回模拟结果，
 * 这样页面可以在浏览器中预览；发布到小程序时必须由真实 payInfo 调用 wx.requestPayment。
 */
export const requestWechatPayment = payInfo => {
  if (!payInfo) return Promise.reject(new Error('缺少微信支付参数'))

  if (!globalThis.wx || typeof globalThis.wx.requestPayment !== 'function') {
    return Promise.resolve({ simulated: true })
  }

  return new Promise((resolve, reject) => {
    globalThis.wx.requestPayment({
      ...payInfo,
      success: resolve,
      fail: reject
    })
  })
}
