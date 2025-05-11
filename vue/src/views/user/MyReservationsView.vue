<template>
  <div class="my-reservations">
    <!-- 顶部筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="filterStatus" placeholder="预约状态" clearable>
        <el-option
          v-for="(config, status) in reservationStatus"
          :key="status"
          :label="config.text"
          :value="status"
        />
      </el-select>

      <el-date-picker
        v-model="filterDate"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :shortcuts="dateShortcuts"
      />

      <el-input
        v-model="searchKeyword"
        placeholder="搜索自习室"
        :prefix-icon="Search"
        clearable
        class="search-input"
      />
    </div>

    <!-- 预约列表表格 -->
    <el-table
      v-loading="loading"
      :data="filteredReservations"
      style="width: 100%"
      :header-cell-style="{
        background: '#f5f7fa',
        color: '#606266'
      }"
      @row-click="handleViewDetail"
      class="reservation-table"
    >
      <el-table-column prop="studyRoomName" label="自习室" min-width="120">
        <template #default="{ row }">
          <div class="room-info">
            <span>{{ row.studyRoomName }}</span>
            <span class="seat-number">座位号：{{ row.seatNumber }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="预约时间" min-width="280">
        <template #default="{ row }">
          <div class="time-info">
            <el-icon><Calendar /></el-icon>
            <span>{{ row.date }}</span>
            <el-icon><Timer /></el-icon>
            <span>{{ row.startTime }} - {{ row.endTime }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="reservationStatus[row.status]?.type || 'info'">
            {{ reservationStatus[row.status]?.text || row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="160" align="center">
        <template #default="{ row }">
          <div class="operation-buttons">
            <!-- 待使用状态的操作 -->
            <template v-if="row.status === 'CONFIRMED'">
              <el-button-group>
                <el-button type="primary" size="small" @click.stop="handleCheckIn(row)">
                  签到
                </el-button>
                <el-button type="danger" size="small" @click.stop="handleCancel(row)">
                  取消
                </el-button>
              </el-button-group>
            </template>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="预约详情"
      width="500px"
    >
      <div v-if="selectedReservation" class="reservation-detail">
        <div class="detail-item">
          <span class="label">自习室：</span>
          <span>{{ selectedReservation.studyRoomName }}</span>
        </div>
        <div class="detail-item">
          <span class="label">座位号：</span>
          <span>{{ selectedReservation.seatNumber }}</span>
        </div>
        <div class="detail-item">
          <span class="label">预约日期：</span>
          <span>{{ selectedReservation.date }}</span>
        </div>
        <div class="detail-item">
          <span class="label">时间段：</span>
          <span>{{ selectedReservation.startTime }} - {{ selectedReservation.endTime }}</span>
        </div>
        <div class="detail-item">
          <span class="label">预约状态：</span>
          <el-tag :type="reservationStatus[selectedReservation.status]?.type || 'info'">
            {{ reservationStatus[selectedReservation.status]?.text || selectedReservation.status }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="label">创建时间：</span>
          <span>{{ selectedReservation.createdAt }}</span>
        </div>
        <template v-if="selectedReservation.checkInTime">
          <div class="detail-item">
            <span class="label">签到时间：</span>
            <span>{{ selectedReservation.checkInTime }}</span>
          </div>
        </template>
        <template v-if="selectedReservation.cancelTime">
          <div class="detail-item">
            <span class="label">取消时间：</span>
            <span>{{ selectedReservation.cancelTime }}</span>
          </div>
          <div class="detail-item">
            <span class="label">取消原因：</span>
            <span>{{ selectedReservation.cancelReason }}</span>
          </div>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Calendar, Timer, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserReservations, checkInReservation, cancelReservation, reservationStatus } from '@/api/reservation'

// 加载状态
const loading = ref(false)

// 预约列表数据
const reservations = ref([])

// 筛选状态
const filterStatus = ref('')
const filterDate = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 日期快捷选项
const dateShortcuts = [
  {
    text: '今天',
    value: () => {
      const today = new Date()
      return [today, today]
    }
  },
  {
    text: '本周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  }
]

// 获取预约列表
const fetchReservations = async () => {
  loading.value = true
  try {
    const data = await getUserReservations()
    reservations.value = data
    total.value = data.length
  } catch (error) {
    console.error('获取预约列表失败:', error)
    ElMessage.error(error.message || '获取预约列表失败')
  } finally {
    loading.value = false
  }
}

// 过滤后的预约列表
const filteredReservations = computed(() => {
  let result = [...reservations.value]

  // 状态筛选
  if (filterStatus.value) {
    result = result.filter(item => item.status === filterStatus.value)
  }

  // 日期筛选
  if (filterDate.value && filterDate.value.length === 2) {
    const [start, end] = filterDate.value
    result = result.filter(item => {
      const date = new Date(item.date)
      return date >= start && date <= end
    })
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item =>
      item.studyRoomName.toLowerCase().includes(keyword)
    )
  }

  // 分页
  const startIndex = (currentPage.value - 1) * pageSize.value
  return result.slice(startIndex, startIndex + pageSize.value)
})

// 详情弹窗
const detailDialogVisible = ref(false)
const selectedReservation = ref(null)

// 处理查看详情
const handleViewDetail = (reservation) => {
  selectedReservation.value = reservation
  detailDialogVisible.value = true
}

// 处理签到
const handleCheckIn = async (row) => {
  try {
    // 检查是否可以签到
    const now = new Date()
    const reservationTime = new Date(`${row.date} ${row.startTime}`)
    
    // 计算时间差（分钟）
    const timeDiff = (reservationTime - now) / (1000 * 60)
    
    // 如果距离预约时间还有超过15分钟，显示提示
    if (timeDiff > 15) {
      ElMessage.warning(`签到时间过早，请在预约开始时间 ${row.startTime} 前15分钟内签到`)
      return
    }

    await ElMessageBox.confirm('确认签到？')
    await checkInReservation(row.id)
    ElMessage.success('签到成功')
    fetchReservations()
  } catch (error) {
    if (!error?.message?.includes('取消')) {
      ElMessage.error(error.response?.data?.message || '签到失败')
    }
  }
}

// 处理取消预约
const handleCancel = async (reservation) => {
  try {
    await ElMessageBox.confirm('确认取消该预约？', '提示', {
      type: 'warning'
    })
    await cancelReservation(reservation.id)
    ElMessage.success('预约已取消')
    fetchReservations() // 刷新列表
  } catch (error) {
    if (!error?.message?.includes('取消')) { // 忽略用户取消操作的错误
      ElMessage.error(error.response?.data?.message || '取消预约失败')
    }
  }
}

// 处理分页
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 组件挂载时获取数据
onMounted(() => {
  fetchReservations()
})
</script>

<style scoped>
.my-reservations {
  padding: 20px;
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.search-input {
  width: 200px;
}

.room-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.seat-number {
  font-size: 13px;
  color: #666;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.reservation-detail {
  .detail-item {
    margin-bottom: 16px;
    display: flex;
    align-items: center;

    .label {
      width: 100px;
      color: #666;
    }
  }
}

.reservation-table {
  cursor: pointer;
  
  :deep(tbody tr:hover) {
    background-color: #f5f7fa;
  }
}

.operation-buttons {
  display: flex;
  justify-content: center;
}
</style> 