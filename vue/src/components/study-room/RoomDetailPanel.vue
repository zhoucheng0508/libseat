<template>
  <div class="room-detail-panel">
    <el-skeleton :loading="loading" animated v-if="loading">
      <template #template>
        <div class="skeleton-content">
          <div class="skeleton-header"></div>
          <div class="skeleton-info"></div>
          <div class="skeleton-grid">
            <div class="skeleton-seat" v-for="i in 30" :key="i"></div>
          </div>
        </div>
      </template>
    </el-skeleton>

    <template v-else-if="currentRoom">
      <!-- 自习室基本信息 -->
      <div class="room-brief">
        <div class="brief-info">
          <div class="brief-header">
            <h3>{{ currentRoom.name }}</h3>
            <el-tag :type="getStatusType(currentRoom.status)" size="small">
              {{ getStatusText(currentRoom.status) }}
            </el-tag>
          </div>
          <div class="brief-content">
            <div class="brief-item">
              <el-icon><Location /></el-icon>
              <span>{{ currentRoom.location }}</span>
            </div>
            <div class="brief-item">
              <el-icon><User /></el-icon>
              <span>座位数：{{ currentRoom.totalSeats }}人（可用：{{ currentRoom.availableSeats }}）</span>
            </div>
            <div class="brief-item">
              <el-icon><Clock /></el-icon>
              <span>开放时间：{{ currentRoom.openTime }} - {{ currentRoom.closeTime }}</span>
            </div>
            <div class="brief-item" v-if="currentRoom.description">
              <el-icon><InfoFilled /></el-icon>
              <span>{{ currentRoom.description }}</span>
            </div>
            <div class="brief-item" v-if="currentRoom.maxAdvanceDays">
              <el-icon><Calendar /></el-icon>
              <span>可提前预约：{{ currentRoom.maxAdvanceDays }}天</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 座位布局 -->
      <div class="seat-section">
        <div class="section-header">
          <h4>座位布局</h4>
          <div class="seat-legend">
            <div class="legend-item">
              <span class="seat-dot available"></span>
              <span>可选</span>
            </div>
            <div class="legend-item">
              <span class="seat-dot occupied"></span>
              <span>已占</span>
            </div>
            <div class="legend-item">
              <span class="seat-dot selected"></span>
              <span>已选</span>
            </div>
            <div class="legend-item">
              <span class="seat-dot disabled"></span>
              <span>暂不可用</span>
            </div>
          </div>
        </div>

        <div class="seat-container">
          <div class="seat-grid">
            <div 
              v-for="seat in sortedSeats" 
              :key="seat.id"
              class="seat-item"
              :class="{
                'available': seat.status === 'AVAILABLE',
                'occupied': seat.status === 'OCCUPIED',
                'selected': selectedSeatId === seat.id,
                'disabled': seat.status === 'DISABLED' || seat.status === 'UNAVAILABLE'
              }"
              @click="handleSeatClick(seat)"
            >
              {{ seat.seatNumber }}
            </div>
          </div>
        </div>

        <!-- 预约按钮 -->
        <div class="action-bar" v-if="selectedSeatId">
          <div class="selected-info">
            <span class="label">已选座位：</span>
            <span class="value">{{ getSelectedSeatNumber() }}</span>
          </div>
          <el-button type="primary" @click="handleReserve">确认预约</el-button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Location, Clock, InfoFilled, User, Calendar } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getStudyRoomDetail } from '@/api/reservation'

const props = defineProps({
  studyRoomId: {
    type: String,
    required: true
  },
  dateStr: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['seat-selected', 'reserve'])

const currentRoom = ref(null)
const selectedSeatId = ref(null)
const loading = ref(false)

// 获取自习室详情
const fetchRoomDetail = async () => {
  if (!props.studyRoomId) {
    console.warn('No study room ID provided')
    return
  }
  
  loading.value = true
  try {
    console.log('Fetching room detail with params:', {
      studyRoomId: props.studyRoomId,
      dateStr: props.dateStr,
      startTime: props.startTime,
      endTime: props.endTime
    })
    
    const response = await getStudyRoomDetail(props.studyRoomId, {
      dateStr: props.dateStr,
      startTime: props.startTime,
      endTime: props.endTime
    })
    
    console.log('Room detail response:', response)
    if (response && response.studyRoom) {
      currentRoom.value = {
        ...response.studyRoom,
        seats: response.seats || []
      }
      selectedSeatId.value = null // 重置选中的座位
    } else {
      throw new Error('获取自习室详情失败：数据格式错误')
    }
  } catch (error) {
    console.error('获取自习室详情失败:', error)
    ElMessage.error(error.message || '获取自习室详情失败')
    currentRoom.value = null
  } finally {
    loading.value = false
  }
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    'AVAILABLE': 'success',
    'FULL': 'danger',
    'MAINTENANCE': 'info',
    'DISABLED': 'info',
    'UNAVAILABLE': 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'AVAILABLE': '可预约',
    'FULL': '已满',
    'MAINTENANCE': '维护中',
    'DISABLED': '暂不可用',
    'UNAVAILABLE': '暂不可用'
  }
  return statusMap[status] || '未知状态'
}

// 处理座位点击
const handleSeatClick = (seat) => {
  if (seat.status === 'DISABLED' || seat.status === 'UNAVAILABLE') {
    ElMessage.warning('该座位暂不可用')
    return
  }
  if (seat.status !== 'AVAILABLE') {
    ElMessage.warning('该座位不可选')
    return
  }
  selectedSeatId.value = seat.id
  emit('seat-selected', seat)
}

// 获取选中座位号
const getSelectedSeatNumber = () => {
  if (!selectedSeatId.value || !currentRoom.value?.seats) return ''
  const seat = currentRoom.value.seats.find(s => s.id === selectedSeatId.value)
  return seat ? seat.seatNumber : ''
}

// 处理预约
const handleReserve = () => {
  if (!selectedSeatId.value) {
    ElMessage.warning('请先选择座位')
    return
  }
  const seat = currentRoom.value.seats.find(s => s.id === selectedSeatId.value)
  emit('reserve', {
    seatId: selectedSeatId.value,
    seatNumber: seat.seatNumber,
    studyRoomId: currentRoom.value.id,
    studyRoomName: currentRoom.value.name
  })
}

// 对座位进行排序的计算属性
const sortedSeats = computed(() => {
  if (!currentRoom.value?.seats) return []
  
  return [...currentRoom.value.seats].sort((a, b) => {
    // 提取数字部分进行比较
    const numA = parseInt(a.seatNumber.replace(/\D/g, ''))
    const numB = parseInt(b.seatNumber.replace(/\D/g, ''))
    
    if (numA === numB) {
      // 如果数字相同，按照字母顺序排序（如果有的话）
      return a.seatNumber.localeCompare(b.seatNumber)
    }
    
    return numA - numB
  })
})

// 监听参数变化
watch(
  () => [props.studyRoomId, props.dateStr, props.startTime, props.endTime],
  ([newRoomId]) => {
    console.log('Props changed, new room ID:', newRoomId)
    if (newRoomId) {
      fetchRoomDetail()
    } else {
      currentRoom.value = null
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.room-detail-panel {
  height: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: auto;
}

/* 骨架屏样式 */
.skeleton-content {
  padding: 20px;
}

.skeleton-header {
  height: 32px;
  background: #f5f7fa;
  margin-bottom: 20px;
  width: 200px;
}

.skeleton-info {
  height: 120px;
  background: #f5f7fa;
  margin-bottom: 30px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.skeleton-seat {
  height: 60px;
  background: #f5f7fa;
  border-radius: 8px;
}

.room-brief {
  padding: 16px;
  border-radius: 8px;
  background: #f5f7fa;
}

.brief-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.brief-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.brief-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.brief-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.brief-item .el-icon {
  color: #909399;
}

.seat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.seat-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #606266;
}

.seat-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.seat-dot.available {
  background-color: #67c23a;
}

.seat-dot.occupied {
  background-color: #f56c6c;
}

.seat-dot.selected {
  background-color: #409eff;
}

.seat-dot.disabled {
  background-color: #e4e7ed;
}

.seat-container {
  flex: 1;
  overflow: auto;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.seat-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  justify-items: center;
}

.seat-item {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  cursor: pointer;
  transition: all 0.2s;
}

.seat-item.available {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}

.seat-item.occupied {
  background-color: #fef0f0;
  border-color: #fde2e2;
  color: #f56c6c;
  cursor: not-allowed;
}

.seat-item.selected {
  background-color: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.seat-item.disabled {
  background-color: #f4f4f5;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}

.seat-item.available:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selected-info .label {
  color: #606266;
}

.selected-info .value {
  color: #303133;
  font-weight: 500;
}
</style> 