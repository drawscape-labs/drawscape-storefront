import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * Drawscape API client
 * All requests are sent through the /api/drawscape/* route to keep .env variables server-side
 * This is a simple wrapper around axios that adds a default base URL and handles errors
 */

const DEFAULT_BASE = '/api/drawscape';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type RequestOptions = Omit<AxiosRequestConfig, 'url' | 'method' | 'data' | 'params' | 'headers' | 'responseType'> & {
  headers?: Record<string, string>;
  responseType?: AxiosRequestConfig['responseType'];
};

async function request<T>(
  method: HttpMethod,
  endpoint: string,
  data?: any,
  params?: Record<string, any>,
  options: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    ...(!(data instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {})
  };

  const axiosConfig: AxiosRequestConfig = {
    method,
    url: `${DEFAULT_BASE}/${endpoint.replace(/^\//, '')}`,
    headers,
    responseType: options.responseType || 'json',
    data,
    params,
    ...options,
  };

  try {
    const response: AxiosResponse<T> = await axios(axiosConfig);
    return options.responseType === 'blob' ? (response as unknown as T) : response.data;
  } catch (error: unknown) {
    let errorMessage = 'An error has occurred';
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as { message?: string; error?: string } | undefined;
      errorMessage = data?.message || data?.error || error.message || errorMessage;
    }
    throw new Error(errorMessage);
  }
}

export default {
  get: <T = any>(endpoint: string, params?: Record<string, any>, options?: RequestOptions) =>
    request<T>('GET', endpoint, undefined, params, options),
  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    request<T>('POST', endpoint, data, undefined, options),
  put: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    request<T>('PUT', endpoint, data, undefined, options),
  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>('DELETE', endpoint, undefined, undefined, options),
};