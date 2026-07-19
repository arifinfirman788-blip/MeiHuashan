import { runtimeConfig } from '@/config/env'

const createUrl = (path, params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  ).toString()
  const baseUrl = `${runtimeConfig.apiBaseUrl.replace(/\/$/, '')}${runtimeConfig.apiPrefix}${path}`
  return query ? `${baseUrl}?${query}` : baseUrl
}

const getResponseData = payload => {
  if (payload && Object.prototype.hasOwnProperty.call(payload, 'data')) return payload.data
  return payload
}

/* 统一处理请求头、响应状态和接口业务错误，业务接口只关注 data。 */
export const request = async (path, options = {}) => {
  const { method = 'GET', params, body, headers = {} } = options
  const response = await fetch(createUrl(path, method === 'GET' ? params : {}), {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || `请求失败：${response.status}`)
  if (payload.success === false) throw new Error(payload.message || '接口返回失败')
  return getResponseData(payload)
}
