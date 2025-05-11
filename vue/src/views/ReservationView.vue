<script setup>
import { ref, computed } from 'vue'
import StudyRoomList from '@/components/study-room/StudyRoomList.vue'
import RoomDetailPanel from '@/components/study-room/RoomDetailPanel.vue'
import { formatDate, formatTime, getNextHalfHour } from '@/utils/date'
import { ArrowLeft } from '@element-plus/icons-vue'

// 日期和时间选择
const selectedDate = ref(new Date())
const selectedStartTime = ref(formatTime(new Date()))
const selectedEndTime = ref(getNextHalfHour(new Date()))

// 选中的自习室
const selectedRoom = ref(null)

// 格式化的日期字符串
const dateStr = computed(() => formatDate(selectedDate.value))

// 处理自习室选择
const handleRoomSelect = (room) => {
  console.log('Selected room in parent:', room)
  selectedRoom.value = {
    ...room,
    id: room.id.toString() // 确保ID是字符串类型
  }
}

// 处理座位选择
const handleSeatSelect = (seat) => {
  console.log('Selected seat:', seat)
}

// 处理预约提交
const handleReserve = (reservationData) => {
  console.log('Reservation data:', reservationData)
}
</script>

<template>
  <div class="reservation-view">
    <!-- 时间选择区域 -->
    <div class="time-selection">
      <el-date-picker
        v-model="selectedDate"
        type="date"
        placeholder="选择日期"
        :disabled-date="date => date < new Date()"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
      />
      <el-time-select
        v-model="selectedStartTime"
        placeholder="开始时间"
        :start="'08:00'"
        :end="'21:30'"
        :step="'00:30'"
        :disabled="!selectedDate"
      />
      <el-time-select
        v-model="selectedEndTime"
        placeholder="结束时间"
        :start="'08:30'"
        :end="'22:00'"
        :step="'00:30'"
        :min-time="selectedStartTime"
        :disabled="!selectedStartTime"
      />
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 自习室列表 -->
      <div class="room-list-section">
        <StudyRoomList
          :date-str="dateStr"
          :start-time="selectedStartTime"
          :end-time="selectedEndTime"
          @select-room="handleRoomSelect"
        />
      </div>

      <!-- 自习室详情和座位选择 -->
      <div class="room-detail-section">
        <RoomDetailPanel
          v-if="selectedRoom"
          :study-room-id="selectedRoom.id"
          :date-str="dateStr"
          :start-time="selectedStartTime"
          :end-time="selectedEndTime"
          @seat-selected="handleSeatSelect"
          @reserve="handleReserve"
        />
        <div v-else class="empty-state">
          <el-icon><ArrowLeft /></el-icon>
          <span>请选择一个自习室</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reservation-view {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.time-selection {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.main-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  min-height: 0;
}

.room-list-section,
.room-detail-section {
  height: 100%;
  overflow: hidden;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
  gap: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.empty-state .el-icon {
  font-size: 24px;
}
</style> 