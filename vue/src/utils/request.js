import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建axios实例
const service = axios.create({
  baseURL: 'https://yzagvphpzake.sealoshzh.site/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'application/json',
    'Accept-Language': 'zh-CN',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 获取请求路径
    const url = config.url || ''
    console.log('请求信息:', config)
    // 登录和注册请求不需要token
    if (url.includes('login') || url.includes('register')) {
      return config
    }

    // 使用window.location.pathname获取实时路径
    const currentPath = window.location.pathname
    console.log('当前实时路径:', currentPath)
    
    // 判断是否为管理员请求（根据URL和路径）
    const isAdminRequest = currentPath.includes('/admin') || url.includes('admins/')
    const userToken = localStorage.getItem('userToken')
    const adminToken = localStorage.getItem('adminToken')
    
    console.log('请求拦截器 - 当前状态:', {
      url,
      currentPath,
      realPath: window.location.pathname,
      isAdminRequest,
      hasUserToken: userToken ? '存在' : '不存在',
      hasAdminToken: adminToken ? '存在' : '不存在'
    })
    
    // 根据请求类型添加对应的token
    if (isAdminRequest) {
      if (!adminToken) {
        console.log('管理员请求缺少token')
        router.push('/admin/login')
        return Promise.reject(new Error('请先登录管理员账号'))
      }
      config.headers.Authorization = `Bearer ${adminToken}`
      console.log('使用管理员token，当前路径:', currentPath)
    } else {
      if (!userToken) {
        console.log('用户请求缺少token')
        router.push('/login')
        return Promise.reject(new Error('请先登录'))
      }
      config.headers.Authorization = `Bearer ${userToken}`
      console.log('使用用户token，当前路径:', currentPath)
    }
    
    // 移除开头的斜杠，避免双斜杠问题
    if (typeof config.url === 'string') {
      config.url = config.url.replace(/^\/+/, '')
    }

    // 详细的请求日志
    console.log('完整请求配置:', {
      url: `${config.baseURL}/${config.url}`,
      method: config.method,
      headers: config.headers,
      data: config.data
    })

    return config
  },
  error => {
    console.error('请求配置错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    console.log('Response:', response)
    return response.data
  },
  error => {
    console.error('Response Error:', error)
    
    // 打印完整的错误响应，方便调试
    console.log('Error Response Data:', error.response?.data)
    
    if (error.response) {
      // 判断是否为创建预约请求
      console.log('error.config:', error.config)
      const isCreateReservationRequest = 
        // 直接创建预约的请求（URL精确匹配）
        (error.config?.url === 'reservations' && error.config.method === 'post') ||
        // API中可能会有其他形式的预约创建URL
        (error.config?.url?.endsWith('/reservations') && error.config.method === 'post')
      
      // 仅对非创建预约请求显示错误提示
      if (!isCreateReservationRequest) {
        // 统一处理所有错误状态码
        const errorMessage = error.response.data?.message || '请求失败'
        ElMessage.error(errorMessage)
      }
      
      // 处理401错误（需要特殊处理token和跳转）
      if (error.response.status === 401) {
        // 清除token
        localStorage.removeItem('userToken')
        localStorage.removeItem('adminToken')
        // 跳转到登录页
        router.push('/login')
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }
    return Promise.reject(error)
  }
)

export default service
