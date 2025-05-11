import request from '@/utils/request'

// 管理员注册
export async function adminRegister(username, password, verificationCode) {
  // 注册请求
  const registerResponse = await request('/admins/register', {
    method: 'POST',
    data: { 
      "username": username, 
      "password": password, 
      "verificationCode": verificationCode 
    }
  })

  // 注册成功后自动登录
  if (registerResponse.success) {
    return await adminLogin(username, password)
  }

  return registerResponse
}

// 管理员登录
export async function adminLogin(username, password) {
  console.log('发送管理员登录请求')
  
  // 清除所有登录状态
  localStorage.removeItem('userToken')
  localStorage.removeItem('adminToken')
  localStorage.removeItem('userId')
  localStorage.removeItem('adminId')
  localStorage.removeItem('username')
  localStorage.removeItem('isAdmin')

  const data = await request({
    url: '/admins/login',
    method: 'POST',
    data: { "username": username, "password": password }
  })

  if (!data.token || !data.userId) {
    console.error('登录返回数据格式错误:', data)
    throw new Error('登录返回数据格式错误')
  }

  console.log('登录返回数据:', data)
  
  // 存储管理员信息
  localStorage.setItem('adminToken', data.token)
  localStorage.setItem('isAdmin', 'true')
  localStorage.setItem('adminId', data.userId)  // 确保转换为字符串
  localStorage.setItem('username', data.username)


  // 等待存储完成
  await new Promise(resolve => setTimeout(resolve, 100))
  

  return data
}

// 获取管理员信息
export async function getAdminInfo(adminId) {
  if (!adminId) {
    throw new Error('未提供管理员ID')
  }
  return request(`/admins/${adminId}`)
}

// 获取验证码（如果需要）
export async function getVerificationCode(username) {
  return request('/admins/verification-code', {
    method: 'POST',
    data: { "username": username }
  })
}

// 管理员修改自身密码
export function changeAdminPassword(adminId, oldPassword, newPassword) {
  return request({
    url: '/admins/change-password',
    method: 'put',
    data: {
      adminId,
      oldPassword,
      newPassword
    }
  })
}

// 管理员修改用户密码
export function changeUserPassword(userId, newPassword) {
  return request({
    url: '/admins/users/change-password',
    method: 'put',
    data: {
      userId,
      newPassword
    }
  })
}

// 管理员获取所有用户列表
export function getAllUsers() {
  return request({
    url: '/admins/users',
    method: 'get'
  })
} 