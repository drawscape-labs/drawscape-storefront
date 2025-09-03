import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

console.log('Drawscape API', import.meta.env.VITE_DRAWSCAPE_API_URL);

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions extends Omit<AxiosRequestConfig, 'url' | 'method' | 'data' | 'params' | 'headers' | 'responseType'> {
  headers?: Record<string, string>;
  responseType?: AxiosRequestConfig['responseType'];
  [key: string]: any;
}

type APIType = {
  get: <T = any>(endpoint: string, params?: Record<string, any>, options?: RequestOptions) => Promise<T>;
  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions) => Promise<T>;
  put: <T = any>(endpoint: string, data?: any, options?: RequestOptions) => Promise<T>;
  delete: <T = any>(endpoint: string, options?: RequestOptions) => Promise<T>;
};

const API: APIType = {
  get: async <T = any>(endpoint: string, params?: Record<string, any>, options: RequestOptions = {}) => {
    return request<T>('GET', endpoint, undefined, params, options);
  },

  post: async <T = any>(endpoint: string, data?: any, options: RequestOptions = {}) => {
    return request<T>('POST', endpoint, data, undefined, options);
  },

  put: async <T = any>(endpoint: string, data?: any, options: RequestOptions = {}) => {
    return request<T>('PUT', endpoint, data, undefined, options);
  },

  delete: async <T = any>(endpoint: string, options: RequestOptions = {}) => {
    return request<T>('DELETE', endpoint, undefined, undefined, options);
  },
}

export default API

async function request<T = any>(
  method: HttpMethod,
  endpoint: string,
  data?: any,
  params?: Record<string, any>,
  options: RequestOptions = {}
): Promise<T> {
  const apiUrl: string | undefined = import.meta.env.VITE_DRAWSCAPE_API_URL as
    | string
    | undefined;
  if (!apiUrl) {
    throw new Error('API URL environment variable is not configured');
  }

  try {
    const headers: Record<string, string> = {
      ...(!(data instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    };

    const axiosConfig: AxiosRequestConfig = {
      method,
      url: `${apiUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`,
      headers,
      responseType: options.responseType || 'json',
      data,
      params,
      ...Object.fromEntries(
        Object.entries(options).filter(([key]) =>
          !['responseType', 'headers'].includes(key)
        )
      )
    };

    const response: AxiosResponse<T> = await axios(axiosConfig);

    if (options.responseType === 'blob') {
      return response as unknown as T;
    }

    return response.data;
  } catch (error: unknown) {
    let errorMessage = 'An error has occurred';
    // Try to extract error message from axios error
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as { message?: string; error?: string } | undefined;
      errorMessage = data?.message || data?.error || errorMessage;
    }
    throw new Error(errorMessage);
  }
}