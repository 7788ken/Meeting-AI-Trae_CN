import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

// 创建Axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 这里可以添加认证token等
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
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
const apiRequest = {
  get: <T>(url: string, config?: AxiosRequestConfig) => {
    return apiClient.get<T>(url, config)
  },
  
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return apiClient.post<T>(url, data, config)
  },
  
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return apiClient.put<T>(url, data, config)
  },
  
  delete: <T>(url: string, config?: AxiosRequestConfig) => {
    return apiClient.delete<T>(url, config)
  }
}

export default apiRequest
