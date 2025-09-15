/**
 * Server-side Drawscape API client
 *
 * Import:
 *   import drawscapeServerApi from '~/lib/drawscapeServerApi';
 *
 * Usage inside loader()/action():
 *   const api = drawscapeServerApi('https://drawscape.example.com');
 *   const data = await api.get('/path', { foo: 'bar' }); // GET/DELETE -> data becomes query params
 *   const saved = await api.post('/path', { foo: 'bar' }); // POST/PUT -> data becomes JSON body
 *
 * Pass an explicit baseUrl; no context or env is read here.
 */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type ServerRequestOptions = {
  headers?: Record<string, string>
  responseType?: 'json' | 'text' | 'arrayBuffer' | 'raw'
  signal?: AbortSignal
}

function normalizeBaseUrl(baseUrl: string): string {
  if (!baseUrl) throw new Error('baseUrl is required for Drawscape server API client')
  return baseUrl.replace(/\/$/, '')
}

function buildUrl(baseUrl: string, endpoint: string, params?: Record<string, unknown>): string {
  const path = endpoint.replace(/^\//, '')
  const url = new URL(`${baseUrl}/${path}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      url.searchParams.append(key, String(value))
    })
  }
  return url.toString()
}

async function request<T>(
  method: HttpMethod,
  baseUrl: string,
  endpoint: string,
  data?: any,
  options: ServerRequestOptions = {}
): Promise<T> {
  const headers = new Headers(options.headers || {})

  const isQueryMethod = method === 'GET' || method === 'DELETE'

  if (!isQueryMethod && !(data instanceof FormData)) {
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  }

  const url = buildUrl(
    baseUrl,
    endpoint,
    isQueryMethod && data && typeof data === 'object' ? (data as Record<string, unknown>) : undefined
  )

  const init: RequestInit = {
    method,
    headers,
    signal: options.signal,
  }

  if (!isQueryMethod) {
    init.body = data instanceof FormData ? data : data !== undefined ? JSON.stringify(data) : undefined
  }

  let response: Response
  try {
    response = await fetch(url, init)
  } catch (error) {
    throw new Error('Network error while contacting Drawscape API')
  }

  if (!response.ok) {
    let message = response.statusText || 'Request failed'
    try {
      const maybeJson = await response.clone().json() as { message?: string; error?: string }
      message = maybeJson?.message || maybeJson?.error || message
    } catch (_) {
      try {
        message = await response.clone().text()
      } catch (_) {}
    }
    throw new Error(message)
  }

  switch (options.responseType) {
    case 'text':
      return (await response.text()) as unknown as T
    case 'arrayBuffer':
      return (await response.arrayBuffer()) as unknown as T
    case 'raw':
      return response as unknown as T
    case 'json':
    default:
      // If no content, return undefined as T
      if (response.status === 204) return undefined as unknown as T
      return (await response.json()) as T
  }
}

export function drawscapeServerApi(baseUrl: string) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl)

  return {
    get: <T = any>(endpoint: string, data?: Record<string, unknown>, reqOptions?: ServerRequestOptions) =>
      request<T>('GET', normalizedBaseUrl, endpoint, data, reqOptions),
    post: <T = any>(endpoint: string, data?: any, reqOptions?: ServerRequestOptions) =>
      request<T>('POST', normalizedBaseUrl, endpoint, data, reqOptions),
    put: <T = any>(endpoint: string, data?: any, reqOptions?: ServerRequestOptions) =>
      request<T>('PUT', normalizedBaseUrl, endpoint, data, reqOptions),
    delete: <T = any>(endpoint: string, data?: Record<string, unknown>, reqOptions?: ServerRequestOptions) =>
      request<T>('DELETE', normalizedBaseUrl, endpoint, data, reqOptions),
  }
}

export default drawscapeServerApi


