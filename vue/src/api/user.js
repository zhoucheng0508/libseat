import request from '@/utils/request'

// 用户注册
export async function register(username, password) {
  // 注册请求
  const registerResponse = await request('/users/register', {
    method: 'POST',
    data: { "username": username, "password": password }
  })
  
  // 注册成功后自动登录
  if (registerResponse.success) {
    return await login(username, password)
  }
  
  return registerResponse
}

// 用户登录
export async function login(username, password) {
  // 清除所有登录状态
  localStorage.removeItem('userToken')
  localStorage.removeItem('adminToken')
  localStorage.removeItem('userId')
  localStorage.removeItem('adminId')
  localStorage.removeItem('username')
  localStorage.removeItem('isAdmin')

  const response = await request({
    url: '/users/login',
    method: 'POST',
    data: {
      username,
      password
    }
  })
  
  if (!response.token || !response.userId || !response.username) {
    throw new Error('登录返回数据格式错误')
  }
  
  // 存储用户信息
  localStorage.setItem('userToken', response.token)
  localStorage.setItem('userId', response.userId)
  localStorage.setItem('username', response.username)
  localStorage.setItem('isAdmin', 'false')  // 明确标记为非管理员用户
  
  // 等待存储完成
  await new Promise(resolve => setTimeout(resolve, 100))

  console.log('用户信息存储完成:', {
    userToken: response.token ? '已设置' : '未设置',
    userId: localStorage.getItem('userId'),
    username: localStorage.getItem('username'),
    isAdmin: localStorage.getItem('isAdmin')
  })
  
  return response
}

// 获取用户信息
export function getUserInfo(userId) {
  return request({
    url: `/users/${userId}`,
    method: 'get'
  })
}

// 修改密码的API接口
export function changePassword(userId, oldPassword, newPassword) {
  return request({
    url: '/users/change-password',
    method: 'put',
    data: {
      userId,
      oldPassword,
      newPassword
    }
  })
} 