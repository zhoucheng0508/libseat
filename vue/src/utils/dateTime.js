/**
 * 将日期格式化为 YYYY-MM-DD 格式
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 将时间格式化为 HH:mm 格式
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的时间字符串
 */
export const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * 获取当前时间段（当前时间到一小时后）
 * @returns {Object} 包含日期、开始时间和结束时间的对象
 */
export const getCurrentTimeSlot = () => {
  const now = new Date()
  const endTime = new Date(now.getTime() + 60 * 60 * 1000) // 当前时间加1小时

  return {
    date: formatDate(now),
    startTime: formatTime(now),
    endTime: formatTime(endTime)
  }
} 