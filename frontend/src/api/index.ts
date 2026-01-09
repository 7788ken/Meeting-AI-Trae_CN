import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosRequestConfig, type AxiosResponse } from 'axios'

// 创建Axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加请求日志，用于调试
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data || '')
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API Response:', response.status, response.data)
    return response
  },
  (error: any) => {
    let errorMessage = '请求失败'
    if (error.response) {
      // 服务器返回错误状态码
      errorMessage = error.response.data?.message || `请求失败，状态码：${error.response.status}`
      console.error('API Error:', error.response.data)
    } else if (error.request) {
      // 请求已发送但没有收到响应
      errorMessage = '服务器无响应，请检查网络连接'
      console.error('API Error:', error.request)
    } else {
      // 请求配置错误
      errorMessage = error.message
      console.error('API Error:', error.message)
    }
    return Promise.reject(new Error(errorMessage))
  }
)

// 封装请求方法
export default {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get(url, config)
    return response.data as T
  },
  
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post(url, data, config)
    return response.data as T
  },
  
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put(url, data, config)
    return response.data as T
  },
  
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete(url, config)
    return response.data as T
  }
}
