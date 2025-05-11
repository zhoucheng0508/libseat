/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化时间为 HH:mm
 * @param {Date} date
 * @returns {string}
 */
export function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(Math.floor(date.getMinutes() / 30) * 30).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * 获取下一个整点或半点时间
 * @param {Date} date
 * @returns {string}
 */
export function getNextHalfHour(date) {
  const nextDate = new Date(date)
  const minutes = nextDate.getMinutes()
  if (minutes <= 30) {
    nextDate.setMinutes(30)
  } else {
    nextDate.setHours(nextDate.getHours() + 1)
    nextDate.setMinutes(0)
  }
  return formatTime(nextDate)
} 