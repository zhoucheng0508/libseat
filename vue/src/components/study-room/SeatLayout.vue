<template>
  <div class="seat-layout">
    <div class="time-selection">
      <el-select v-model="selectedTimeSlot" placeholder="选择时间段">
        <el-option
          v-for="slot in timeSlots"
          :key="slot.start"
          :label="`${slot.start} - ${slot.end}`"
          :value="slot"
        />
      </el-select>
    </div>

    <div class="seat-grid" v-if="currentRoom">
      <div 
        v-for="seat in currentSeats" 
        :key="seat.id"
        class="seat"
        :class="{
          'available': seat.status === 'available',
          'reserved': seat.status === 'reserved',
          'unavailable': seat.status === 'unavailable',
          'selected': selectedSeat?.id === seat.id
        }"
        @click="selectSeat(seat)"
      >
        <div class="seat-number">{{ seat.number }}</div>
        <div class="seat-features">
          <el-icon v-if="seat.hasPower"><Connection /></el-icon>
          <el-icon v-if="seat.hasWindow"><View /></el-icon>
        </div>
      </div>
    </div>

    <div v-else class="no-room-selected">
      <el-empty description="请先选择自习室" />
    </div>

    <!-- 座位详情弹窗 -->
    <el-dialog
      v-model="showSeatDetail"
      title="座位详情"
      width="400px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedSeat" class="seat-detail">
        <div class="detail-item">
          <span class="label">座位号：</span>
          <span class="value">{{ selectedSeat.number }}</span>
        </div>
        <div class="detail-item">
          <span class="label">区域：</span>
          <span class="value">{{ selectedSeat.area }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <el-tag :type="getStatusType(selectedSeat.status)">
            {{ getStatusText(selectedSeat.status) }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="label">设施：</span>
          <div class="facilities">
            <el-tag v-if="selectedSeat.hasPower" type="success" size="small">电源</el-tag>
            <el-tag v-if="selectedSeat.hasWindow" type="warning" size="small">靠窗</el-tag>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSeatDetail = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleReserve"
            :disabled="selectedSeat?.status !== 'available'"
          >
            立即预约
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Connection, View } from '@element-plus/icons-vue'
import { seats, timeSlots } from '@/mock/studyRoom'

const props = defineProps({
  currentRoom: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['seat-selected', 'reserve'])

const selectedTimeSlot = ref(null)
const selectedSeat = ref(null)
const showSeatDetail = ref(false)

const currentSeats = computed(() => {
  if (!props.currentRoom) return []
  return seats[props.currentRoom.id] || []
})

const getStatusType = (status) => {
  switch (status) {
    case 'available': return 'success'
    case 'reserved': return 'danger'
    case 'unavailable': return 'info'
    default: return 'info'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'available': return '可预约'
    case 'reserved': return '已预约'
    case 'unavailable': return '不可预约'
    default: return '未知'
  }
}

const selectSeat = (seat) => {
  selectedSeat.value = seat
  showSeatDetail.value = true
  emit('seat-selected', seat)
}

const handleReserve = () => {
  if (!selectedSeat.value || !selectedTimeSlot.value) return
  
  emit('reserve', {
    seat: selectedSeat.value,
    timeSlot: selectedTimeSlot.value
  })
  
  showSeatDetail.value = false
}
</script>

<style scoped>
.seat-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background-color: #f5f7fa;
}

.time-selection {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.seat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.seat {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.seat.available {
  background-color: #f0f9eb;
  border: 2px solid #67c23a;
}

.seat.reserved {
  background-color: #fef0f0;
  border: 2px solid #f56c6c;
  cursor: not-allowed;
}

.seat.unavailable {
  background-color: #f4f4f5;
  border: 2px solid #909399;
  cursor: not-allowed;
}

.seat.selected {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.seat-number {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.seat-features {
  position: absolute;
  bottom: 4px;
  right: 4px;
  display: flex;
  gap: 4px;
}

.no-room-selected {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.seat-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  width: 80px;
  color: #606266;
}

.value {
  color: #303133;
}

.facilities {
  display: flex;
  gap: 8px;
}
</style> 