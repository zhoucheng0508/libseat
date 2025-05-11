import axios from 'axios'
import request from '@/utils/request'  // 导入封装好的request

// API基础URL
const API_BASE_URL = 'https://yzagvphpzake.sealoshzh.site'

// 处理后端返回的数据格式差异
export const processApiResponse = (response) => {
  // 处理空值或错误情况
  if (!response) {
    console.error('API响应为空')
    return null
  }
  
  // 尝试判断响应类型
  if (typeof response === 'string') {
    console.error('收到字符串响应而非预期的JSON数据:', response.substring(0, 100) + '...')
    try {
      // 尝试解析JSON字符串
      const parsed = JSON.parse(response)
      return parsed?.data || parsed
    } catch (e) {
      // 如果是HTML响应会解析失败
      console.error('解析响应字符串失败，可能是HTML而非JSON')
      return null
    }
  }
  
  // 检查是否有data字段包装
  if (response.data && typeof response.data === 'object') {
    return response.data.data || response.data
  }
  
  // 如果没有.data字段，则直接返回response本身
  return response
}

// API状态到UI状态的映射
export const mapApiStatusToUI = (status) => {
  // 确保状态是大写的
  const upperStatus = (status || '').toUpperCase()
  
  // 状态映射表
  const statusMap = {
    'AVAILABLE': 'AVAILABLE',
    'FULL': 'FULL',
    'MAINTENANCE': 'MAINTENANCE',
    'ACTIVE': 'AVAILABLE',
    'INACTIVE': 'MAINTENANCE'
  }
  
  return statusMap[upperStatus] || 'MAINTENANCE'
}

// 将后端自习室对象转换为前端格式
export const transformRoomData = (room) => {
  if (!room) return null
  
  // 确保状态是大写的
  const status = (room.status || '').toUpperCase()
  
  // 处理图片URL，添加前缀
  let imageUrl = room.imageUrl || ''
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    // 确保URL以/开头
    if (!imageUrl.startsWith('/')) {
      imageUrl = '/' + imageUrl
    }
    imageUrl = `${API_BASE_URL}${imageUrl}`
  }
  
  return {
    id: room.id || '',
    name: room.name || '',
    location: room.location || '',
    capacity: room.capacity || 0,
    status: status,  // 不再使用mapApiStatusToUI，保持原始状态
    imageUrl: imageUrl,
    description: room.description || '',
    openTime: room.openTime || '08:00',
    closeTime: room.closeTime || '22:00',
    createdAt: room.createdAt || new Date().toISOString()
  }
}

// 处理后端返回的自习室列表
export const processRoomList = (response) => {
  const data = processApiResponse(response)
  console.log("返回的数据" + data)
  if (Array.isArray(data)) {
    return data.map(room => transformRoomData(room))
  } else if (data && typeof data === 'object') {
    // 单个对象返回
    return [transformRoomData(data)]
  }
  
  // 返回空数组作为默认值
  console.log("数据异常返回空")
  return []
}

// 处理单个自习室数据
export const processSingleRoom = (response) => {
  const data = processApiResponse(response)
  return transformRoomData(data)
}

// 获取所有自习室（增强版）
export const getAllStudyRooms = async () => {
  try {
    const response = await request('admins/study-rooms')
    console.log("原始数据:", response)
    return processRoomList(response)
  } catch (error) {
    console.error('获取自习室列表失败:', error)
    throw error
  }
}

// 获取单个自习室信息（增强版）
export const getStudyRoomById = async (id) => {
  try {
    const response = await request(`admins/study-rooms/${id}`)
    return processSingleRoom(response)
  } catch (error) {
    console.error(`获取自习室(${id})详情失败:`, error)
    throw error
  }
}

// 获取自习室实时座位状态（增强版）
export const getRealTimeSeatsStatus = async (id, dateStr) => {
  try {
    const response = await request(`admins/study-rooms/${id}/seats/real-time-status`, {
      params: { dateStr }
    })
    return processApiResponse(response)
  } catch (error) {
    console.error(`获取自习室(${id})座位状态失败:`, error)
    return null // 座位数据获取失败返回null
  }
}

// 创建自习室（使用JSON格式）
export const createStudyRoom = async (roomData) => {
  try {
    // 检查是否有base64图片
    const hasBase64Image = roomData.imageUrl && typeof roomData.imageUrl === 'string' && roomData.imageUrl.startsWith('data:image')
    let imageBase64 = hasBase64Image ? roomData.imageUrl : null
    
    // 创建JSON数据对象
    const createData = {
      name: roomData.name,
      location: roomData.location,
      capacity: roomData.capacity,
      description: roomData.description || '',
      openTime: roomData.openTime,
      closeTime: roomData.closeTime
    }
    
    // 将状态转换为大写格式
    const statusMap = {
      'active': 'AVAILABLE',
      'inactive': 'MAINTENANCE'
    }
    createData.status = statusMap[roomData.status] || 'AVAILABLE'
    
    // 如果是非base64的图片URL，则直接传递
    if (roomData.imageUrl && !hasBase64Image) {
      createData.imageUrl = roomData.imageUrl
    }
    
    // 发送创建请求
    console.log('创建自习室基本信息:', createData)
    const createResponse = await request('admins/study-rooms', {
      method: 'post',
      data: createData
    })
    
    // 获取新创建的自习室ID和对象
    const newRoomId = createResponse.id || createResponse.data?.id
    let finalRoomData = createResponse
    
    // 如果有base64图片且成功获取了ID，进行图片上传
    if (imageBase64 && newRoomId) {
      try {
        const uploadResponse = await uploadStudyRoomImage(newRoomId, imageBase64)
        console.log('图片上传成功', uploadResponse)
        
        // 使用返回的studyRoom对象更新最终返回数据
        if (uploadResponse && uploadResponse.studyRoom) {
          finalRoomData = uploadResponse.studyRoom
        }
      } catch (error) {
        console.error('图片上传失败:', error)
        // 图片上传失败不影响主流程
      }
    }
    
    // 确保返回的数据经过transformRoomData处理
    return transformRoomData(processApiResponse(finalRoomData))
  } catch (error) {
    console.error('创建自习室失败:', error)
    throw error
  }
}

// 更新自习室（使用JSON格式）
export const updateStudyRoom = async (id, roomData) => {
  try {
    // 检查是否有base64图片
    const hasBase64Image = roomData.imageUrl && typeof roomData.imageUrl === 'string' && roomData.imageUrl.startsWith('data:image')
    
    // 创建JSON数据对象
    const updateData = {
      name: roomData.name,
      location: roomData.location,
      capacity: parseInt(roomData.capacity), // 确保capacity是数字
      description: roomData.description || '',
      openTime: roomData.openTime,
      closeTime: roomData.closeTime
    }
    
    // 将状态转换为大写格式
    const statusMap = {
      'active': 'AVAILABLE',
      'inactive': 'MAINTENANCE'
    }
    updateData.status = statusMap[roomData.status] || 'AVAILABLE'
    
    // 如果是非base64的图片URL，则直接传递
    if (roomData.imageUrl && !hasBase64Image) {
      updateData.imageUrl = roomData.imageUrl
    }
    
    // 发送更新请求
    console.log('更新自习室基本信息:', updateData)
    const updateResponse = await request(`admins/study-rooms/${id}`, {
      method: 'put',
      data: updateData
    })
    
    let finalRoomData = updateResponse
    
    // 如果有base64图片，进行图片上传
    if (hasBase64Image) {
      try {
        const uploadResponse = await uploadStudyRoomImage(id, roomData.imageUrl)
        console.log('图片上传成功', uploadResponse)
        
        // 使用返回的studyRoom对象更新最终返回数据
        if (uploadResponse && uploadResponse.studyRoom) {
          finalRoomData = uploadResponse.studyRoom
        }
      } catch (error) {
        console.error('图片上传失败:', error)
        // 图片上传失败不影响主流程
      }
    }
    
    return finalRoomData
  } catch (error) {
    console.error('更新自习室失败:', error)
    throw error
  }
}

// 上传自习室图片
export async function uploadStudyRoomImage(roomId, file) {
  try {
    // 检查文件大小（10MB限制）
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('图片大小不能超过10MB')
    }
    
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('只支持jpg、png、gif格式的图片')
    }
    
    const formData = new FormData()
    formData.append('image', file)  // 使用image作为字段名
    
    const response = await request(`/admins/study-rooms/${roomId}/upload-image`, {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    // 返回完整的自习室信息
    return response.studyRoom
  } catch (error) {
    console.error('图片上传处理失败:', error)
    throw error
  }
}

// 更新自习室状态
export const updateStudyRoomStatus = (id, status) => {
  const statusMap = {
    'active': 'AVAILABLE',
    'inactive': 'MAINTENANCE'
  }
  
  return request(`admins/study-rooms/${id}/status`, {
    method: 'put',
    data: {
      status: statusMap[status] || status
    }
  })
}

// 删除自习室
export const deleteStudyRoom = (id) => {
  return request(`admins/study-rooms/${id}`, {
    method: 'delete'
  })
}

// 获取自习室特定时间段座位状态
export const getSeatsStatusForTimeSlot = (id, dateStr, startTime, endTime) => {
  return request(`admins/study-rooms/${id}/seats/status-for-time-slot`, {
    params: { dateStr, startTime, endTime }
  })
}

// 获取自习室可用时间段
export const getAvailableTimeSlots = (id, date) => {
  return request(`study-rooms/${id}/available-time-slots`, {
    params: { date }
  })
}

export const mapUIStatusToAPI = (uiStatus) => {
  const statusMap = {
    'active': 'AVAILABLE',
    'inactive': 'MAINTENANCE',
    'closed': 'CLOSED'
  }
  return statusMap[uiStatus] || 'MAINTENANCE'
} 