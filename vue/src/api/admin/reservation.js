import request from '@/utils/request'

/**
 * 分页查询预约记录
 * @param {Object} params 查询参数
 * @returns {Promise} 返回预约记录列表
 */
export const getReservationList = (params) => {
  return request({
    url: '/admin/reservations',
    method: 'get',
    params
  })
}

/**
 * 删除预约记录
 * @param {string} id 预约ID
 * @returns {Promise} 返回操作结果
 */
export const deleteReservation = (id) => {
  const adminId = localStorage.getItem('adminId')
  return request({
    url: `/admin/reservations/${id}`,
    method: 'delete',
    headers: {
      'X-Admin-ID': adminId
    }
  })
}

/**
 * 调整预约状态为已签到
 * @param {string} id 预约ID
 * @returns {Promise} 返回操作结果
 */
export const adjustReservationStatus = (id) => {
  const adminId = localStorage.getItem('adminId')
  return request({
    url: `/admin/reservations/${id}/adjust-status`,
    method: 'put',
    headers: {
      'X-Admin-ID': adminId
    },
    data: {
      status: 'CHECKED_IN'
    }
  })
}

// 预约状态配置
export const reservationStatus = {
  PENDING: {
    text: '待签到',
    type: 'info'
  },
  CONFIRMED: {
    text: '已结束',
    type: 'info'
  },
  CHECKED_IN: {
    text: '已签到',
    type: 'success'
  },
  CANCELLED: {
    text: '已取消',
    type: 'danger'
  },
  NO_SHOW: {
    text: '未签到',
    type: 'warning'
  },
  COMPLETED: {
    text: '已结束',
    type: ''
  }
} 