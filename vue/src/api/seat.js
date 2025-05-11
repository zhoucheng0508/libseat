import request from '@/utils/request'

// 获取自习室的所有座位
export function getStudyRoomSeats(studyRoomId) {
  return request({
    url: `seats/study-room/${studyRoomId}`,
    method: 'get'
  })
}

// 创建新座位
export function addSeat(seatData) {
  return request({
    url: 'seats',
    method: 'post',
    data: seatData
  })
}

// 更新座位状态
export function updateSeatStatus(seatId, status) {
  return request({
    url: `seats/${seatId}/status`,
    method: 'put',
    data: { status }
  })
}

// 删除座位
export function deleteSeat(seatId) {
  return request({
    url: `seats/${seatId}`,
    method: 'delete'
  })
}

// 删除自习室的所有座位
export function deleteAllSeats(studyRoomId) {
  return request({
    url: `seats/study-room/${studyRoomId}`,
    method: 'delete'
  })
} 