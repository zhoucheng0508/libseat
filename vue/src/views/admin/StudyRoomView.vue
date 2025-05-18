<template>
  <div class="study-room-view">
    <!-- 顶部操作区 -->
    <div class="operation-bar">
      <div class="search-area">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索自习室名称或位置"
          class="search-input"
        />
        <select v-model="statusFilter" class="status-select">
          <option value="">全部状态</option>
          <option value="active">正常开放</option>
          <option value="inactive">暂停使用</option>
          <option value="closed">已关闭</option>
        </select>
      </div>
      <button class="add-btn" @click="handleAddRoom">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        新增自习室
      </button>
    </div>

    <!-- 加载状态和错误信息 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中，请稍候...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadStudyRooms" class="retry-btn">重试</button>
    </div>

    <!-- 空状态提示 -->
    <div v-else-if="rooms.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
      </div>
      <p>暂无自习室数据</p>
      <button class="add-btn" @click="handleAddRoom">添加第一个自习室</button>
    </div>

    <!-- 自习室列表 -->
    <div v-else class="room-grid">
      <div v-for="room in filteredRooms" :key="room.id" class="room-card">
        <div class="room-image">
          <img v-if="room.imageUrl" :src="room.imageUrl" :alt="room.name">
          <img v-else :src="defaultImage" :alt="room.name">
        </div>
        <div class="room-info">
          <h3>{{ room.name }}</h3>
          <p class="location">
            <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {{ room.location }}
          </p>
          <p class="capacity">
            <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            容量：{{ room.capacity }}人
          </p>
          <div class="status-tag" :class="room.displayStatus">
            {{ getStatusText(room.displayStatus) }}
          </div>
        </div>
        <div class="room-actions">
          <button class="action-btn edit" @click="handleEdit(room)">编辑</button>
          <button class="action-btn view" @click="handleViewDetails(room)">详情</button>
          <button class="action-btn delete" @click="handleDelete(room)">删除</button>
        </div>
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <StudyRoomForm
      v-model:visible="showForm"
      :is-edit="isEdit"
      :room-data="selectedRoom"
      @refresh="handleRefresh"
    />

    <!-- 详情对话框 -->
    <StudyRoomDetail
      v-if="showDetail"
      v-model:visible="showDetail"
      :room-data="selectedRoom"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllStudyRooms, deleteStudyRoom } from '@/api/studyRoom'
import StudyRoomForm from '@/components/study-room/StudyRoomForm.vue'
import StudyRoomDetail from '@/components/study-room/StudyRoomDetail.vue'
import { ElMessage } from 'element-plus'

// 默认图片
const defaultImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAEsCAYAAADtt+XCAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAWqSURBVHhe7dQxAQAADMOg+TfdycgLHrhBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABUynbw57UdAMANAgIAEQEBgIiAAEBEQAAgIiAAEBEQAIgICAAkxu4DmO33/RJiCU0AAAAASUVORK5CYII='

// 状态
const searchQuery = ref('')
const statusFilter = ref('')
const showForm = ref(false)
const showDetail = ref(false)
const editingRoom = ref(null)
const selectedRoom = ref(null)
const loading = ref(false)
const error = ref('')
const isEdit = ref(false)

// 自习室数据
const rooms = ref([])

// 加载自习室数据
const loadStudyRooms = async () => {
  try {
    loading.value = true
    rooms.value = await getAllStudyRooms()
  } catch (error) {
    console.error('获取自习室列表失败:', error)
    ElMessage.error('获取自习室列表失败')
  } finally {
    loading.value = false
  }
}

// 过滤后的自习室列表
const filteredRooms = computed(() => {
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  
  return rooms.value.filter(room => {
    // 检查是否在开放时间内
    const isWithinOpenHours = isTimeInRange(currentTime, room.openTime, room.closeTime)
    
    // 计算实际状态
    const actualStatus = room.status === 'active' && !isWithinOpenHours ? 'closed' : room.status
    
    // 搜索匹配
    const matchQuery = !searchQuery.value || 
      room.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      room.location.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    // 状态匹配
    const matchStatus = !statusFilter.value || 
      (statusFilter.value === 'closed' ? actualStatus === 'closed' : (actualStatus === statusFilter.value))
    
    return matchQuery && matchStatus
  }).map(room => {
    // 为渲染创建一个新的对象，加入计算后的显示状态
    const isWithinOpenHours = isTimeInRange(currentTime, room.openTime, room.closeTime)
    return {
      ...room,
      displayStatus: room.status === 'active' && !isWithinOpenHours ? 'closed' : room.status
    }
  })
})

// 判断当前时间是否在开放时间范围内
const isTimeInRange = (current, start, end) => {
  // 处理跨日的情况
  if (start > end) {
    return current >= start || current < end
  }
  return current >= start && current < end
}

// 获取状态文本
const getStatusText = (status) => {
  console.log('Status:', status)
  const statusMap = {
    'AVAILABLE': '正常开放',
    'MAINTENANCE': '暂停使用',
    'CLOSED': '已关闭',
    'FULL': '已满',
    'UNAVAILABLE': '不可用'
  }
  return statusMap[status] || '未知状态'
}

// 处理新增自习室
const handleAddRoom = () => {
  editingRoom.value = null
  selectedRoom.value = null
  isEdit.value = false
  showForm.value = true
}

// 处理编辑自习室
const handleEdit = (room) => {
  editingRoom.value = { ...room }
  selectedRoom.value = { ...room }
  isEdit.value = true
  showForm.value = true
}

// 处理查看详情
const handleViewDetails = (room) => {
  selectedRoom.value = room
  showDetail.value = true
}

// 处理表单提交
const handleFormSubmit = async (formData) => {
  showForm.value = false // 立即关闭窗口，避免重复提交
  loading.value = true
  
  try {
    // 重新加载列表以获取最新数据
    await loadStudyRooms()
  } catch (err) {
    console.error('提交自习室数据后刷新列表失败:', err)
  } finally {
    loading.value = false
  }
}

// 处理删除自习室
const handleDelete = async (room) => {
  if (confirm(`确定要删除自习室"${room.name}"吗？此操作不可恢复。`)) {
    loading.value = true
    
    try {
      await deleteStudyRoom(room.id)
      // 删除成功后刷新列表
      await loadStudyRooms()
    } catch (err) {
      console.error('删除自习室失败:', err)
      alert(`删除自习室失败: ${err.response?.data?.message || '未知错误'}`)
    } finally {
      loading.value = false
    }
  }
}

// 处理表单提交后的刷新
const handleRefresh = (updatedRoom) => {
  if (updatedRoom) {
    // 如果是编辑模式，更新现有房间
    const index = rooms.value.findIndex(room => room.id === updatedRoom.id)
    if (index !== -1) {
      rooms.value[index] = updatedRoom
    } else {
      // 如果是新建模式，添加到列表
      rooms.value.push(updatedRoom)
    }
  } else {
    // 如果没有提供更新后的数据，重新加载整个列表
    loadStudyRooms()
  }
}

// 在组件挂载时加载数据
onMounted(() => {
  loadStudyRooms()
})
</script>

<style scoped>
.study-room-view {
  padding: 24px;
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.search-area {
  display: flex;
  gap: 16px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  width: 240px;
  font-size: 14px;
}

.status-select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.add-btn:hover {
  background-color: #40a9ff;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.room-card {
  background-color: white;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.room-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.room-image {
  height: 160px;
  overflow: hidden;
}

.room-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.room-info {
  padding: 12px;
}

.room-info h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
}

.location, .capacity {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 6px 0;
  color: #666;
  font-size: 12px;
}

.info-icon {
  width: 14px;
  height: 14px;
}

.status-tag {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 6px;
}

.status-tag.AVAILABLE {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-tag.UNAVAILABLE {
  background-color: #fff7e6;
  color: #fa8c16;
}

.status-tag.CLOSED {
  background-color: #f5f5f5;
  color: #999;
}

.room-actions {
  padding: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 6px;
}

.action-btn {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.action-btn.edit {
  color: #1890ff;
  border-color: #1890ff;
}

.action-btn.edit:hover {
  background-color: #e6f7ff;
}

.action-btn.view {
  color: #52c41a;
  border-color: #52c41a;
}

.action-btn.view:hover {
  background-color: #f6ffed;
}

.action-btn.delete {
  color: #f5222d;
  border-color: #f5222d;
}

.action-btn.delete:hover {
  background-color: #fff1f0;
}

.loading-state, .error-message, .empty-state {
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
}

.retry-btn {
  margin-top: 16px;
  padding: 6px 16px;
  background-color: #fff;
  border: 1px solid #ff4d4f;
  border-radius: 4px;
  color: #ff4d4f;
  cursor: pointer;
}

.retry-btn:hover {
  background-color: #fff1f0;
}

.empty-state {
  color: #8c8c8c;
}

.empty-icon {
  width: 60px;
  height: 60px;
  color: #d9d9d9;
  margin-bottom: 16px;
}
</style>
