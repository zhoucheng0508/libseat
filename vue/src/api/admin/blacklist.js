import request from '@/utils/request'

// 获取黑名单用户列表
export const getBlacklistUsers = () => {
  return request({
    url: '/users/blacklist',
    method: 'get'
  })
}

// 从黑名单中移除用户
export const removeFromBlacklist = (userId) => {
  return request({
    url: `/users/blacklist/${userId}`,
    method: 'delete'
  })
}

// 将用户添加到黑名单
export const addToBlacklist = (userId) => {
  return request({
    url: `/users/blacklist/${userId}`,
    method: 'post'
  })
} 