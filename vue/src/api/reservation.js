import request from '@/utils/request'
import { formatDate, formatTime } from '@/utils/date'
import { transformRoomData } from '@/api/studyRoom'

/**
 * 获取所有自习室状态
 * @param {Object} params
 * @param {string} [params.dateStr] - 日期，格式：YYYY-MM-DD
 * @param {string} [params.startTime] - 开始时间，格式：HH:mm
 * @param {string} [params.endTime] - 结束时间，格式：HH:mm
 */
export function getStudyRoomsStatus(params = {}) {
  return request({
    url: '/reservations/study-rooms/status',
    method: 'get',
    params: {
      dateStr: params.dateStr || formatDate(new Date()),
      startTime: params.startTime || formatTime(new Date()),
      endTime: params.endTime
    }
  }).then(response => {
    // 处理返回的自习室数据，确保图片URL正确
    if (Array.isArray(response)) {
      return response.map(room => transformRoomData(room))
    } else if (response && Array.isArray(response.data)) {
      return response.data.map(room => transformRoomData(room))
    }
    return []
  })
}

/**
 * 获取自习室详情和座位信息
 * @param {string} studyRoomId - 自习室ID
 * @param {Object} params
 * @param {string} [params.dateStr] - 日期，格式：YYYY-MM-DD
 * @param {string} [params.startTime] - 开始时间，格式：HH:mm
 * @param {string} [params.endTime] - 结束时间，格式：HH:mm
 */
export function getStudyRoomDetail(studyRoomId, params = {}) {
  return request({
    url: `/reservations/study-rooms/${studyRoomId}/detail`,
    method: 'get',
    params: {
      dateStr: params.dateStr || formatDate(new Date()),
      startTime: params.startTime || formatTime(new Date()),
      endTime: params.endTime
    }
  })
}

/**
 * 创建座位预约
 * @param {Object} reservationData
 * @param {string} reservationData.seatId - 座位ID
 * @param {string} reservationData.studyRoomId - 自习室ID
 * @param {string} reservationData.date - 预约日期（YYYY-MM-DD）
 * @param {string} reservationData.startTime - 开始时间（HH:mm）
 * @param {string} reservationData.endTime - 结束时间（HH:mm）
 * @returns {Promise} 预约结果
 */
export function createReservation(reservationData) {
  // 直接从 localStorage 获取 userId
  const userId = localStorage.getItem('userId')
  
  if (!userId) {
    return Promise.reject(new Error('请先登录'))
  }

  return request({
    url: '/reservations',
    method: 'post',
    data: {
      userId: userId,  // 直接使用 userId
      seatId: reservationData.seatId,
      studyRoomId: reservationData.studyRoomId,
      date: reservationData.date,
      startTime: reservationData.startTime,
      endTime: reservationData.endTime
    }
  })
}

// 获取用户预约列表
export const getUserReservations = () => {
  const userId = localStorage.getItem('userId')
  return request({
    url: `/reservations/user/${userId}`,
    method: 'get'
  })
}

// 预约签到
export const checkInReservation = (id) => {
  const userId = localStorage.getItem('userId')
  return request({
    url: `/reservations/${id}/check-in`,
    method: 'post',
    headers: {
      'X-User-ID': userId
    }
  })
}

// 取消预约
export const cancelReservation = (id) => {
  const userId = localStorage.getItem('userId')
  return request({
    url: `/reservations/${id}/cancel`,
    method: 'put',
    headers: {
      'X-User-ID': userId
    }
  })
}

// 预约状态配置
export const reservationStatus = {
  PENDING: {
    text: '待使用',
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

// 快速预约
export const quickReserve = (data) => {
  return request({
    url: '/reservations/quick',
    method: 'post',
    data
  })
} 