<template>
  <div class="time-selector">
    <!-- 日期选择 -->
    <el-date-picker
      v-model="selectedDate"
      type="date"
      placeholder="选择日期"
      :disabled-date="disableDateOptions"
      format="YYYY-MM-DD"
      value-format="YYYY-MM-DD"
      @change="handleDateChange"
      size="default"
      class="date-picker"
    />
    
    <!-- 开始时间选择 -->
    <el-select
      v-model="selectedStartTime"
      placeholder="开始时间"
      @change="handleStartTimeChange"
      size="default"
      class="time-select"
    >
      <el-option
        v-for="slot in availableStartTimes"
        :key="slot.value"
        :label="slot.label"
        :value="slot.value"
        :disabled="slot.disabled"
      />
    </el-select>

    <!-- 结束时间选择 -->
    <el-select
      v-model="selectedEndTime"
      placeholder="结束时间"
      @change="handleEndTimeChange"
      size="default"
      class="time-select"
      :disabled="!selectedStartTime"
    >
      <el-option
        v-for="slot in availableEndTimes"
        :key="slot.value"
        :label="slot.label"
        :value="slot.value"
        :disabled="slot.disabled"
      />
    </el-select>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 定义组件事件
const emit = defineEmits(['update:date', 'update:startTime', 'update:endTime'])

// 响应式状态
const selectedDate = ref('')
const selectedStartTime = ref('')
const selectedEndTime = ref('')

// 所有可选时间段
const timeSlots = [
  { label: '08:00', value: '08:00' },
  { label: '09:00', value: '09:00' },
  { label: '10:00', value: '10:00' },
  { label: '11:00', value: '11:00' },
  { label: '12:00', value: '12:00' },
  { label: '13:00', value: '13:00' },
  { label: '14:00', value: '14:00' },
  { label: '15:00', value: '15:00' },
  { label: '16:00', value: '16:00' },
  { label: '17:00', value: '17:00' },
  { label: '18:00', value: '18:00' },
  { label: '19:00', value: '19:00' },
  { label: '20:00', value: '20:00' },
  { label: '21:00', value: '21:00' },
  { label: '22:00', value: '22:00' }
]

// 计算可选的开始时间
const availableStartTimes = computed(() => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const currentHour = now.getHours()
  
  return timeSlots.map(slot => {
    const hour = parseInt(slot.value.split(':')[0])
    const disabled = selectedDate.value === today && hour <= currentHour
    return { ...slot, disabled }
  })
})

// 计算可选的结束时间
const availableEndTimes = computed(() => {
  if (!selectedStartTime.value) return []
  
  const startHour = parseInt(selectedStartTime.value.split(':')[0])
  return timeSlots.map(slot => {
    const hour = parseInt(slot.value.split(':')[0])
    const disabled = hour <= startHour
    return { ...slot, disabled }
  })
})

// 禁用日期选项（只能选择未来7天内的日期）
const disableDateOptions = (time) => {
  const today = new Date()
  const sevenDaysLater = new Date()
  sevenDaysLater.setDate(today.getDate() + 7)
  
  return time.getTime() < today.getTime() - 8.64e7 || // 禁用过去的日期
         time.getTime() > sevenDaysLater.getTime()    // 禁用7天后的日期
}

// 事件处理函数
const handleDateChange = (value) => {
  emit('update:date', value)
  // 如果日期变化，重置时间选择
  selectedStartTime.value = ''
  selectedEndTime.value = ''
  emit('update:startTime', '')
  emit('update:endTime', '')
}

const handleStartTimeChange = (value) => {
  selectedStartTime.value = value
  // 如果开始时间变化，重置结束时间
  selectedEndTime.value = ''
  emit('update:startTime', value)
  emit('update:endTime', '')
}

const handleEndTimeChange = (value) => {
  selectedEndTime.value = value
  emit('update:endTime', value)
}

// 初始化默认值
const initDefaultValues = () => {
  // 获取今天的日期，并确保使用本地时间
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const today = `${year}-${month}-${day}`
  
  // 设置默认日期为今天
  selectedDate.value = today
  
  // 设置默认开始时间为下一个整点
  const currentHour = now.getHours()
  const nextHour = currentHour + 1
  if (nextHour < 22) {
    const startTime = `${String(nextHour).padStart(2, '0')}:00`
    selectedStartTime.value = startTime
    emit('update:startTime', startTime)
    
    // 设置默认结束时间为开始时间后两小时
    const endHour = Math.min(nextHour + 2, 22)
    const endTime = `${String(endHour).padStart(2, '0')}:00`
    selectedEndTime.value = endTime
    emit('update:endTime', endTime)
  }
  
  // 确保触发日期更新事件
  emit('update:date', selectedDate.value)
}

// 组件挂载时初始化默认值
initDefaultValues()
</script>

<style scoped>
.time-selector {
  display: flex;
  gap: 16px;
  align-items: center;
}

.date-picker {
  width: 160px;
}

.time-select {
  width: 120px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .time-selector {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .date-picker,
  .time-select {
    width: 100%;
  }
}
</style> 