import request from '@/utils/request'

// 提交反馈
export function submitFeedback(data) {
  return request({
    url: '/feedback',
    method: 'post',
    data
  })
}

// 获取用户反馈列表
export function getUserFeedbackList(userId) {
  return request({
    url: '/feedback',
    method: 'get',
    params: { userId }
  })
}

// 获取反馈详情
export function getFeedbackDetail(id) {
  return request({
    url: `/feedback/${id}`,
    method: 'get'
  })
} 