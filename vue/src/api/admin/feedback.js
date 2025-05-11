import request from '@/utils/request'

// 获取所有反馈列表（管理员接口）
export function getFeedbackList() {
  return request({
    url: '/admin/feedback',
    method: 'get'
  })
}

// 处理反馈
export const processFeedback = (data) => {
  return request({
    url: `/admin/feedback/${data.feedbackId}`,
    method: 'put',
    data: {
      processorId: data.processorId,
      response: data.response
    }
  })
} 