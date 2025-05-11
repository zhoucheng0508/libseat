<template>
  <div class="reservation-view">
    <!-- 顶部时间筛选 -->
    <div class="time-filter">
      <div class="filter-content">
        <TimeSelector 
          :date="selectedDate"
          :start-time="selectedStartTime"
          :end-time="selectedEndTime"
          @update:date="handleDateChange"
          @update:start-time="handleStartTimeChange"
          @update:end-time="handleEndTimeChange"
        />
        <el-button 
          type="primary" 
          :disabled="!selectedStartTime || !selectedEndTime"
          @click="handleSearch"
        >
          查询可用自习室
        </el-button>
        <el-button type="primary" @click="showQuickReservationDialog">
          快速预约
        </el-button>
      </div>
    </div>

    <div class="reservation-container">
      <!-- 左侧自习室列表 -->
      <div class="room-list-section">
        <StudyRoomList 
          v-if="showRoomList"
          :date-str="selectedDate"
          :start-time="selectedStartTime"
          :end-time="selectedEndTime"
          :should-fetch="shouldFetch"
          @room-selected="handleRoomSelected"
          @rooms-update="handleRoomsUpdate"
        />
        <div v-else class="empty-state">
          <el-icon><Search /></el-icon>
          <p>请选择时间段并点击查询</p>
        </div>
      </div>
      
      <!-- 右侧座位选择 -->
      <div class="seat-section">
        <RoomDetailPanel
          v-if="selectedRoom"
          :study-room-id="selectedRoom.id"
          :date-str="selectedDate"
          :start-time="selectedStartTime"
          :end-time="selectedEndTime"
          @seat-selected="handleSeatSelected"
        />
        <div v-else class="empty-state">
          <el-icon><Select /></el-icon>
          <p>请选择一个自习室</p>
        </div>
      </div>
    </div>

    <!-- 快速预约对话框 -->
    <el-dialog
      v-model="quickReservationDialog.visible"
      title="快速预约"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="quickReservationFormRef"
        :model="quickReservationForm"
        :rules="quickReservationRules"
        label-width="80px"
      >
        <el-form-item label="预约日期" prop="date">
          <el-date-picker
            v-model="quickReservationForm.date"
            type="date"
            placeholder="选择日期"
            :min-date="new Date()"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-select
            v-model="quickReservationForm.startTime"
            placeholder="选择开始时间"
            style="width: 100%"
          >
            <el-option
              v-for="hour in 24"
              :key="hour - 1"
              :label="`${String(hour - 1).padStart(2, '0')}:00`"
              :value="`${String(hour - 1).padStart(2, '0')}:00`"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-select
            v-model="quickReservationForm.endTime"
            placeholder="选择结束时间"
            style="width: 100%"
          >
            <el-option
              v-for="hour in 24"
              :key="hour - 1"
              :label="`${String(hour - 1).padStart(2, '0')}:00`"
              :value="`${String(hour - 1).padStart(2, '0')}:00`"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="quickReservationDialog.visible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="quickReservationDialog.loading"
            @click="submitQuickReservation"
          >
            确认预约
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Select, Search } from '@element-plus/icons-vue'
import TimeSelector from '@/components/study-room/TimeSelector.vue'
import StudyRoomList from '@/components/study-room/StudyRoomList.vue'
import RoomDetailPanel from '@/components/study-room/RoomDetailPanel.vue'
import { createReservation, quickReserve } from '@/api/reservation'
import { useRouter } from 'vue-router'

const router = useRouter()

// 获取当前时间的整点或半点
const getCurrentTimeSlot = () => {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  
  // 如果分钟大于30，向上取整到下一个小时
  // 如果分钟小于等于30，取当前小时的半点
  if (minutes > 30) {
    return `${String(hours + 1).padStart(2, '0')}:00`
  } else {
    return `${String(hours).padStart(2, '0')}:30`
  }
}

// 获取默认结束时间（当前时间往后2小时）
const getDefaultEndTime = (startTime) => {
  const [hours, minutes] = startTime.split(':').map(Number)
  const endHours = hours + 2
  return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

// 状态
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedStartTime = ref(getCurrentTimeSlot())
const selectedEndTime = ref(getDefaultEndTime(getCurrentTimeSlot()))
const selectedRoom = ref(null)
const selectedSeat = ref(null)
const showRoomList = ref(true)  // 默认显示自习室列表
const shouldFetch = ref(false)  // 控制是否获取数据
const rooms = ref([])  // 存储自习室列表数据

// 快速预约相关
const quickReservationFormRef = ref(null)
const quickReservationForm = reactive({
  date: new Date(),
  startTime: null,
  endTime: null
})

const quickReservationRules = {
  date: [{ required: true, message: '请选择预约日期', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const quickReservationDialog = reactive({
  visible: false,
  loading: false
})

// 事件处理
const handleDateChange = (date) => {
  selectedDate.value = date
  selectedRoom.value = null // 重置选中的自习室
  showRoomList.value = false // 重置显示状态
  shouldFetch.value = false // 重置获取状态
}

const handleStartTimeChange = (time) => {
  selectedStartTime.value = time
  selectedRoom.value = null // 重置选中的自习室
  showRoomList.value = false // 重置显示状态
  shouldFetch.value = false // 重置获取状态
}

const handleEndTimeChange = (time) => {
  selectedEndTime.value = time
  selectedRoom.value = null // 重置选中的自习室
  showRoomList.value = false // 重置显示状态
  shouldFetch.value = false // 重置获取状态
}

const handleRoomSelected = (room) => {
  selectedRoom.value = room
  selectedSeat.value = null
}

const handleSeatSelected = (seat) => {
  selectedSeat.value = seat
  // 显示预约确认对话框
  showReservationConfirm()
}

// 显示预约确认对话框
const showReservationConfirm = () => {
  if (!selectedSeat.value || !selectedRoom.value) {
    ElMessage.warning('请先选择座位')
    return
  }

  ElMessageBox.confirm(
    `确认预约以下座位吗？\n
    自习室：${selectedRoom.value.name}\n
    座位号：${selectedSeat.value.seatNumber}\n
    日期：${selectedDate.value}\n
    时间：${selectedStartTime.value} - ${selectedEndTime.value}`,
    '预约确认',
    {
      confirmButtonText: '确认预约',
      cancelButtonText: '取消',
      type: 'info'
    }
  )
    .then(() => {
      handleReserve()
    })
    .catch(() => {
      // 用户取消预约
      selectedSeat.value = null
    })
}

// 处理预约提交
const handleReserve = async () => {
  if (!selectedSeat.value || !selectedRoom.value) {
    ElMessage.warning('请先选择座位')
    return
  }

  try {
    const reservationData = {
      seatId: selectedSeat.value.id,
      studyRoomId: selectedRoom.value.id,
      date: selectedDate.value,
      startTime: selectedStartTime.value,
      endTime: selectedEndTime.value
    }

    const response = await createReservation(reservationData)
    
    ElMessage.success('预约成功！')
    
    // 保存当前选中的自习室ID
    const currentRoomId = selectedRoom.value.id
    
    // 重置选择状态
    selectedSeat.value = null
    selectedRoom.value = null
    
    // 触发自习室列表刷新
    shouldFetch.value = false
    await nextTick()
    shouldFetch.value = true
    
    // 等待自习室列表刷新完成后，重新选中之前的自习室
    await nextTick()
    const roomToSelect = rooms.value?.find(room => room.id === currentRoomId)
    if (roomToSelect) {
      handleRoomSelected(roomToSelect)
    }
    
  } catch (error) {
    let errorMessage = '预约失败'
    
    // 处理不同类型的错误
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = '请先登录'
          router.push('/login')
          break
        case 409:
          errorMessage = '该座位在指定时间段已被预约'
          break
        case 400:
          // 检查是否是黑名单错误
          if (error.response.data?.message?.includes('黑名单')) {
            const remainingTime = error.response.data.remainingTime
            let timeText = '一段时间'
            
            if (remainingTime) {
              const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24))
              const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
              
              if (days > 0) {
                timeText = `${days}天${hours}小时`
              } else {
                timeText = `${hours}小时`
              }
              
              errorMessage = `您已被加入黑名单，暂时无法预约。解除时间还剩：${timeText}`
            } else {
              errorMessage = error.response.data.message
            }
          } else {
            errorMessage = error.response.data?.message || '请求参数错误'
          }
          break
        default:
          errorMessage = error.response.data?.message || '预约失败，请稍后重试'
      }
    } else if (error.message === '请先登录') {
      errorMessage = error.message
      router.push('/login')
    }
    
    ElMessage.error(errorMessage)
    selectedSeat.value = null
  }
}

// 处理搜索
const handleSearch = () => {
  if (!selectedStartTime.value || !selectedEndTime.value) {
    ElMessage.warning('请选择完整的时间段')
    return
  }
  
  // 检查时间段是否合理
  const start = new Date(`2000-01-01 ${selectedStartTime.value}`)
  const end = new Date(`2000-01-01 ${selectedEndTime.value}`)
  
  if (end <= start) {
    ElMessage.warning('结束时间必须晚于开始时间')
    return
  }
  
  showRoomList.value = true
  shouldFetch.value = true  // 触发数据获取
}

// 监听自习室列表组件的数据更新
const handleRoomsUpdate = (updatedRooms) => {
  rooms.value = updatedRooms
}

// 显示快速预约对话框
const showQuickReservationDialog = () => {
  quickReservationDialog.visible = true
}

// 格式化日期
const formatDate = (date) => {
  return date.toISOString().split('T')[0]
}

// 格式化时间
const formatTime = (time) => {
  return time.toTimeString().slice(0, 5)
}

// 提交快速预约
const submitQuickReservation = async () => {
  if (!quickReservationFormRef.value) return

  await quickReservationFormRef.value.validate(async (valid) => {
    if (valid) {
      quickReservationDialog.loading = true
      try {
        const params = {
          date: formatDate(quickReservationForm.date),
          startTime: quickReservationForm.startTime,
          endTime: quickReservationForm.endTime,
          userId: localStorage.getItem('userId')
        }

        await quickReserve(params)
        ElMessage.success('预约成功')
        quickReservationDialog.visible = false
        
        // 更新当前选中的日期和时间
        selectedDate.value = formatDate(quickReservationForm.date)
        selectedStartTime.value = quickReservationForm.startTime
        selectedEndTime.value = quickReservationForm.endTime
        
        // 刷新自习室列表
        handleSearch()
      } catch (error) {
        console.error('快速预约失败:', error)
        ElMessage.error(error.message || '预约失败')
      } finally {
        quickReservationDialog.loading = false
      }
    }
  })
}

// 组件挂载时执行初始搜索
onMounted(() => {
  // 如果当前时间已经超过22:00，设置为明天早上的时间段
  const now = new Date()
  const hours = now.getHours()
  
  if (hours >= 22) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    selectedDate.value = tomorrow.toISOString().split('T')[0]
    selectedStartTime.value = '08:00'
    selectedEndTime.value = '10:00'
  }
  
  // 执行搜索
  handleSearch()
})
</script>

<style scoped>
.reservation-view {
  height: 100%;
  padding: 16px;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.time-filter {
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.filter-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.reservation-container {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
}

.room-list-section {
  height: 100%;
  min-height: 0;
}

.seat-section {
  height: 100%;
  min-height: 0;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  color: #909399;
}

.empty-state .el-icon {
  font-size: 48px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}
</style> 