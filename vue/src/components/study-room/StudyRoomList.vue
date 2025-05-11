<template>
  <div class="study-room-list">
    <el-scrollbar height="calc(100vh - 200px)">
      <div class="room-list">
        <div 
          v-for="room in rooms" 
          :key="room.id"
          class="room-card"
          :class="[
            room.status.toLowerCase(),
            { 'selected': currentRoomId === room.id }
          ]"
          @click="handleRoomClick(room)"
        >
          <div class="room-image">
            <el-image 
              :src="room.imageUrl" 
              fit="cover"
              :preview-src-list="[]"
            >
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div class="room-info">
            <div class="info-header">
              <h3>{{ room.name }}</h3>
              <el-tag 
                :type="getStatusType(room.status)"
                size="small"
              >
                {{ getStatusText(room.status) }}
              </el-tag>
            </div>
            <div class="info-content">
              <div class="info-item">
                <el-icon><Location /></el-icon>
                <span>{{ room.location }}</span>
              </div>
              <div class="info-item">
                <el-icon><Clock /></el-icon>
                <span>{{ room.openTime }} - {{ room.closeTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Location, Picture, Clock } from '@element-plus/icons-vue'
import { getStudyRoomsStatus } from '@/api/reservation'
import { ElMessage } from 'element-plus'

const props = defineProps({
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
  },
  shouldFetch: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['room-selected', 'rooms-update'])

const rooms = ref([])
const currentRoomId = ref(null)
const loading = ref(false)

// 获取自习室列表
const fetchStudyRooms = async () => {
  if (!props.shouldFetch) return
  
  loading.value = true
  try {
    console.log('Fetching study rooms with params:', {
      dateStr: props.dateStr,
      startTime: props.startTime,
      endTime: props.endTime
    })
    
    const response = await getStudyRoomsStatus({
      dateStr: props.dateStr,
      startTime: props.startTime,
      endTime: props.endTime
    })
    console.log('API Response:', response)
    
    // 检查response是否为数组
    if (Array.isArray(response)) {
      rooms.value = response
      emit('rooms-update', rooms.value)  // 通知父组件数据更新
      console.log('Processed studyRooms:', rooms.value)
    } else if (response && Array.isArray(response.data)) {
      // 如果response是对象且有data字段是数组
      rooms.value = response.data
      emit('rooms-update', rooms.value)  // 通知父组件数据更新
      console.log('Processed studyRooms from data:', rooms.value)
    } else {
      rooms.value = []
      emit('rooms-update', [])  // 通知父组件数据为空
      console.warn('Invalid response format:', response)
    }
  } catch (error) {
    console.error('获取自习室列表失败:', error)
    ElMessage.error(error.message || '获取自习室列表失败')
    rooms.value = []
    emit('rooms-update', [])  // 通知父组件数据为空
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
    'CLOSED': 'warning'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'AVAILABLE': '可预约',
    'FULL': '已满',
    'MAINTENANCE': '维护中',
    'CLOSED': '未开放'
  }
  return statusMap[status] || '未知状态'
}

// 处理自习室点击
const handleRoomClick = (room) => {
  console.log('Room clicked:', room)
  if (room.status === 'MAINTENANCE') {
    ElMessage.warning('该自习室正在维护中')
    return
  }
  if (room.status === 'CLOSED') {
    ElMessage.warning('该自习室当前未开放')
    return
  }
  currentRoomId.value = room.id
  emit('room-selected', room)
}

// 监听属性变化
watch(
  () => props.shouldFetch,
  (newVal) => {
    if (newVal) {
      fetchStudyRooms()
    }
  },
  { immediate: true }
)

onMounted(() => {
  fetchStudyRooms()
})
</script>

<style scoped>
.study-room-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  height: 100%;
  padding: 16px;
}

.room-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.room-card {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  background: white;
  border: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.room-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.room-card.selected {
  border: 2px solid var(--el-color-primary);
}

.room-card.available {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
}

.room-card.full {
  background-color: #fef0f0;
  border-color: #fde2e2;
}

.room-card.maintenance {
  background-color: #f4f4f5;
  border-color: #e9e9eb;
  cursor: not-allowed;
}

.room-card.closed {
  background-color: #fdf6ec;
  border-color: #faecd8;
  cursor: not-allowed;
}

.room-image {
  width: 100%;
  height: 140px;
  overflow: hidden;
}

.room-image :deep(.el-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
}

.image-placeholder .el-icon {
  font-size: 24px;
}

.room-info {
  padding: 12px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 13px;
}

.info-item .el-icon {
  font-size: 16px;
  color: #909399;
}

:deep(.el-tag) {
  border-radius: 4px;
}

:deep(.el-tag--success) {
  --el-tag-bg-color: var(--el-color-success-light-9);
  --el-tag-border-color: var(--el-color-success-light-5);
  --el-tag-text-color: var(--el-color-success);
}

:deep(.el-tag--danger) {
  --el-tag-bg-color: var(--el-color-danger-light-9);
  --el-tag-border-color: var(--el-color-danger-light-5);
  --el-tag-text-color: var(--el-color-danger);
}

:deep(.el-tag--info) {
  --el-tag-bg-color: var(--el-color-info-light-9);
  --el-tag-border-color: var(--el-color-info-light-5);
  --el-tag-text-color: var(--el-color-info);
}

:deep(.el-tag--warning) {
  --el-tag-bg-color: var(--el-color-warning-light-9);
  --el-tag-border-color: var(--el-color-warning-light-5);
  --el-tag-text-color: var(--el-color-warning);
}
</style> 