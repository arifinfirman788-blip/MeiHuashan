/* 统一管理前端运行时配置，正式环境通过 Vite 环境变量注入。 */
export const runtimeConfig = {
  apiBaseUrl: import.meta.env.VITE_MALL_API_BASE_URL || '',
  apiPrefix: import.meta.env.VITE_MALL_API_PREFIX || '/api/v2/mallapi',
  merchantId: import.meta.env.VITE_MALL_MERCHANT_ID || '',
  resourcesId: import.meta.env.VITE_MALL_RESOURCES_ID || '',
  appId: import.meta.env.VITE_WECHAT_APP_ID || '',
  openid: import.meta.env.VITE_WECHAT_OPENID || ''
}

export const isMallApiConfigured = () => Boolean(runtimeConfig.apiBaseUrl && runtimeConfig.resourcesId)
