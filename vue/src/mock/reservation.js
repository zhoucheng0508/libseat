// 模拟预约数据
export const mockReservations = [
  {
    id: '1',
    studyRoomName: '一号自习室',
    seatNumber: 'A12',
    date: '2024-03-20',
    startTime: '09:00',
    endTime: '11:00',
    status: 'PENDING',  // 待使用
    createTime: '2024-03-19 15:30:00'
  },
  {
    id: '2',
    studyRoomName: '二号自习室',
    seatNumber: 'B05',
    date: '2024-03-20',
    startTime: '13:00',
    endTime: '15:00',
    status: 'IN_USE',  // 使用中
    createTime: '2024-03-19 10:00:00',
    checkInTime: '2024-03-20 12:55:00'
  },
  {
    id: '3',
    studyRoomName: '三号自习室',
    seatNumber: 'C08',
    date: '2024-03-19',
    startTime: '14:00',
    endTime: '16:00',
    status: 'COMPLETED',  // 已完成
    createTime: '2024-03-19 09:00:00',
    checkInTime: '2024-03-19 13:55:00',
    endTime: '2024-03-19 16:00:00'
  },
  {
    id: '4',
    studyRoomName: '一号自习室',
    seatNumber: 'A15',
    date: '2024-03-19',
    startTime: '16:00',
    endTime: '18:00',
    status: 'CANCELLED',  // 已取消
    createTime: '2024-03-19 10:00:00',
    cancelTime: '2024-03-19 11:00:00',
    cancelReason: '临时有事'
  },
  {
    id: '5',
    studyRoomName: '二号自习室',
    seatNumber: 'B10',
    date: '2024-03-19',
    startTime: '09:00',
    endTime: '11:00',
    status: 'EXPIRED',  // 已过期（未签到）
    createTime: '2024-03-18 15:00:00'
  }
]

// 预约状态配置
export const reservationStatus = {
  PENDING: {
    text: '待使用',
    type: 'primary'
  },
  IN_USE: {
    text: '使用中',
    type: 'success'
  },
  COMPLETED: {
    text: '已完成',
    type: 'info'
  },
  CANCELLED: {
    text: '已取消',
    type: 'danger'
  },
  EXPIRED: {
    text: '已过期',
    type: 'warning'
  }
} 