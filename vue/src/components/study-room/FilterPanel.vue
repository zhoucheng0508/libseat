<template>
  <div class="filter-panel">
    <el-card>
      <template #header>
        <div class="filter-header">
          <span>筛选条件</span>
          <el-button text @click="resetFilters">重置</el-button>
        </div>
      </template>
      <el-form>
        <el-form-item label="自习室状态">
          <el-checkbox-group v-model="roomStatus" @change="handleFilterChange">
            <el-checkbox label="open">开放中</el-checkbox>
            <el-checkbox label="full">已满</el-checkbox>
            <el-checkbox label="maintenance">维护中</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="座位状态">
          <el-checkbox-group v-model="seatStatus" @change="handleFilterChange">
            <el-checkbox label="available">可预约</el-checkbox>
            <el-checkbox label="reserved">已预约</el-checkbox>
            <el-checkbox label="maintenance">维护中</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['filter-change'])

const roomStatus = ref(['open'])
const seatStatus = ref(['available'])

const handleFilterChange = () => {
  emit('filter-change', {
    roomStatus: roomStatus.value,
    seatStatus: seatStatus.value
  })
}

const resetFilters = () => {
  roomStatus.value = ['open']
  seatStatus.value = ['available']
  handleFilterChange()
}
</script>

<style scoped>
.filter-panel {
  margin-bottom: 20px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-form-item {
  margin-bottom: 16px;
}

.el-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style> 