<template>
  <div class="study-room-detail-overlay" v-if="visible" @click.self="handleClose">
    <div class="study-room-detail">
      <div class="detail-header">
        <h2>自习室详情</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <div class="detail-body" v-if="loading">
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中，请稍候...</p>
        </div>
      </div>

      <div class="detail-body" v-else-if="error">
        <div class="error-message">
          <p>{{ error }}</p>
        </div>
      </div>

      <div class="detail-body" v-else>
        <!-- 图片展示 -->
        <div class="room-image">
          <img :src="roomImageUrl" :alt="displayData?.name">
        </div>

        <!-- 基本信息 -->
        <div class="info-section">
          <div class="info-header">
            <h3>{{ displayData?.name }}</h3>
            <div class="status-tag" :class="actualStatus">
              {{ getStatusText(actualStatus) }}
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <div class="info-content">
                <label>位置</label>
                <span>{{ displayData?.location }}</span>
              </div>
            </div>

            <div class="info-item">
              <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <div class="info-content">
                <label>容量</label>
                <span>{{ displayData?.capacity }} 人</span>
              </div>
            </div>

            <div class="info-item">
              <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div class="info-content">
                <label>开放时间</label>
                <span>{{ displayData?.openTime }} - {{ displayData?.closeTime }}</span>
              </div>
            </div>

            <div class="info-item">
              <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div class="info-content">
                <label>时间段长度</label>
                <span>{{ displayData?.timeSlotDuration || 60 }} 分钟</span>
              </div>
            </div>
          </div>

          <!-- 描述信息 -->
          <div class="description-section">
            <h4>描述</h4>
            <p>{{ displayData?.description || '暂无描述' }}</p>
          </div>
        </div>

        <div class="seat-management-section">
          <h3>座位管理</h3>
          <SeatManagement :room-id="displayData?.id" />
        </div>
      </div>

      <div class="detail-footer">
        <button class="close-btn-secondary" @click="handleClose">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, watch } from 'vue'
import { getStudyRoomById, getRealTimeSeatsStatus } from '@/api/studyRoom'
import SeatManagement from './SeatManagement.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  roomData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible'])

// 状态
const loading = ref(false)
const error = ref('')
const seatsData = ref(null)
const roomDetail = ref(null)

// 加载自习室详情
const loadRoomDetail = async (roomId) => {
  loading.value = true
  error.value = ''
  
  try {
    // 获取自习室详情 - 使用增强版API已处理数据格式
    roomDetail.value = await getStudyRoomById(roomId)
    
    // 获取座位状态数据 - 使用增强版API
    const today = new Date().toISOString().split('T')[0] // 获取当前日期 YYYY-MM-DD
    seatsData.value = await getRealTimeSeatsStatus(roomId, today)
  } catch (err) {
    console.error('加载自习室详情失败:', err)
    error.value = '加载详情数据失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 监听roomData变化，加载详细数据
watch(() => props.roomData, async (newVal) => {
  if (newVal && newVal.id && props.visible) {
    await loadRoomDetail(newVal.id)
  }
}, { immediate: true })

// 监听visible变化，加载详细数据
watch(() => props.visible, async (newVal) => {
  if (newVal && props.roomData && props.roomData.id) {
    await loadRoomDetail(props.roomData.id)
  }
})

// 获取实际显示的数据（优先使用API数据，其次使用传入的数据）
const displayData = computed(() => {
  return roomDetail.value || props.roomData
})

// 计算实际状态
const actualStatus = computed(() => {
  if (!displayData.value) return ''
  
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  
  // 检查是否在开放时间内
  const isWithinOpenHours = isTimeInRange(currentTime, displayData.value.openTime, displayData.value.closeTime)
  
  // 计算实际状态
  return displayData.value.status === 'active' && !isWithinOpenHours ? 'closed' : displayData.value.status
})

// 判断当前时间是否在开放时间范围内
const isTimeInRange = (current, start, end) => {
  if (!start || !end) return false
  
  // 处理跨日的情况
  if (start > end) {
    return current >= start || current < end
  }
  return current >= start && current < end
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    active: '正常开放',
    inactive: '暂停使用',
    closed: '已关闭'
  }
  return statusMap[status] || '未知状态'
}

// 处理关闭
const handleClose = () => {
  emit('update:visible', false)
}

// 使用计算属性处理自习室详情的图片URL
const roomImageUrl = computed(() => {
  if (roomDetail.value?.imageUrl) {
    return roomDetail.value.imageUrl
  }
  
  
  // 如果roomDetail为空，使用props中的数据
  if (props.roomData?.imageUrl) {
    return props.roomData.imageUrl
  }
  
  // 使用base64默认图片
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAEsCAYAAADtt+XCAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAWqSURBVHhe7dQxAQAADMOg+TfdycgLHrhBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABUynbw57UdAMANAgIAEQEBgIiAAEBEQAAgIiAAEBEQAIgICAAkxu4DmO33/RJiCU0AAAAASUVORK5CYII='
})
</script>

<style scoped>
.study-room-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.study-room-detail {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.detail-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-header h2 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

.detail-body {
  padding: 0;
  overflow-y: auto;
}

.room-image {
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.room-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-section {
  padding: 24px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.info-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.status-tag.active {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-tag.inactive {
  background-color: #fff7e6;
  color: #fa8c16;
}

.status-tag.closed {
  background-color: #f5f5f5;
  color: #999;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-icon {
  width: 24px;
  height: 24px;
  color: #1890ff;
  flex-shrink: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-content label {
  font-size: 14px;
  color: #666;
}

.info-content span {
  font-size: 16px;
  color: #333;
}

.description-section {
  margin-top: 24px;
}

.description-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
}

.description-section p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.detail-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
}

.close-btn-secondary {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: white;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn-secondary:hover {
  color: #40a9ff;
  border-color: #40a9ff;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  text-align: center;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left: 4px solid #1890ff;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #ff4d4f;
  text-align: center;
  padding: 60px 0;
}

.seat-management-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 24px;
}
</style>
