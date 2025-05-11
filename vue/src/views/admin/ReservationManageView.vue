<template>
  <div class="reservation-manage">
    <!-- 顶部筛选区 -->
    <div class="filter-bar">
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="dateShortcuts"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </el-form-item>

        <el-form-item label="预约状态">
          <el-select v-model="queryParams.status" placeholder="选择状态" clearable>
            <el-option
              v-for="(config, status) in reservationStatus"
              :key="status"
              :label="config.text"
              :value="status"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="用户">
          <el-input
            v-model="queryParams.username"
            placeholder="输入用户名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 高级筛选 -->
      <el-collapse v-model="activeCollapse" class="advanced-filter">
        <el-collapse-item title="高级筛选" name="1">
          <el-form :inline="true" :model="queryParams">
            <el-form-item label="自习室">
              <el-input
                v-model="queryParams.studyRoomId"
                placeholder="输入自习室ID"
                clearable
              />
            </el-form-item>
            <el-form-item label="座位">
              <el-input
                v-model="queryParams.seatId"
                placeholder="输入座位ID"
                clearable
              />
            </el-form-item>
            <el-form-item label="排序">
              <el-select v-model="queryParams.sort" placeholder="选择排序方式">
                <el-option label="日期降序" value="date,desc" />
                <el-option label="日期升序" value="date,asc" />
                <el-option label="创建时间降序" value="createdAt,desc" />
                <el-option label="创建时间升序" value="createdAt,asc" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="reservationList"
      style="width: 100%"
      @row-click="handleViewDetail"
      :cell-style="{ padding: '8px 0' }"
    >
      <el-table-column label="用户" prop="username" width="120" />
      <el-table-column label="自习室" width="200">
        <template #default="{ row }">
          <div class="room-info">
            <span>{{ row.studyRoomName }}</span>
            <span class="seat-number">座位号：{{ row.seatNumber }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="预约时间" width="300">
        <template #default="{ row }">
          <div class="time-info">
            <el-icon><Calendar /></el-icon>
            <span>{{ row.date }}</span>
            <el-icon><Timer /></el-icon>
            <span>{{ row.startTime }} - {{ row.endTime }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="reservationStatus[row.status]?.type || 'info'" size="small">
            {{ reservationStatus[row.status]?.text || row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template #default="{ row }">
          <div class="operation-buttons">
            <el-button
              v-if="row.status === 'NO_SHOW'"
              type="primary"
              size="small"
              @click.stop="handleAdjustStatus(row)"
            >
              调整为已签到
            </el-button>
            <el-button
              v-if="!['CHECKED_IN', 'COMPLETED'].includes(row.status)"
              type="danger"
              size="small"
              @click.stop="handleDelete(row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.size"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="预约详情"
      width="600px"
    >
      <div v-if="selectedReservation" class="reservation-detail">
        <div class="detail-item">
          <span class="label">用户：</span>
          <span>{{ selectedReservation.username }}</span>
        </div>
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
        <template v-if="selectedReservation.deletedAt">
          <div class="detail-item">
            <span class="label">删除时间：</span>
            <span>{{ selectedReservation.deletedAt }}</span>
          </div>
          <div class="detail-item">
            <span class="label">删除人：</span>
            <span>{{ selectedReservation.deletedBy }}</span>
          </div>
        </template>
        <template v-if="selectedReservation.adjustedAt">
          <div class="detail-item">
            <span class="label">调整时间：</span>
            <span>{{ selectedReservation.adjustedAt }}</span>
          </div>
          <div class="detail-item">
            <span class="label">调整人：</span>
            <span>{{ selectedReservation.adjustedBy }}</span>
          </div>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Calendar, Timer } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getReservationList, deleteReservation, adjustReservationStatus, reservationStatus } from '@/api/admin/reservation'

// 查询参数
const queryParams = reactive({
  page: 1,
  size: 10,
  username: '',
  status: '',
  studyRoomId: '',
  seatId: '',
  startDate: '',
  endDate: ''
})

// 日期范围
const dateRange = ref([])
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 高级筛选展开状态
const activeCollapse = ref(['1'])

// 表格数据
const loading = ref(false)
const reservationList = ref([])
const total = ref(0)

// 详情弹窗
const detailDialogVisible = ref(false)
const selectedReservation = ref(null)

// 获取预约列表
const getList = async () => {
  loading.value = true
  try {
    // 构建查询参数，过滤掉空值
    const params = {
      ...queryParams,
      page: queryParams.page - 1 // 后端页码从0开始
    }

    // 移除空值参数
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })

    const { content, totalElements } = await getReservationList(params)
    reservationList.value = content
    total.value = totalElements
  } catch (error) {
    console.error('获取预约列表失败:', error)
    ElMessage.error(error.response?.data?.message || '获取预约列表失败')
  } finally {
    loading.value = false
  }
}

// 处理日期变化
const handleDateChange = (dates) => {
  if (dates) {
    const [start, end] = dates
    queryParams.startDate = start
    queryParams.endDate = end
  } else {
    queryParams.startDate = undefined
    queryParams.endDate = undefined
  }
  handleQuery()
}

// 查询操作
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

// 重置查询
const resetQuery = () => {
  dateRange.value = null
  Object.assign(queryParams, {
    page: 1,
    size: 10,
    username: undefined,
    status: undefined,
    studyRoomId: undefined,
    seatId: undefined,
    startDate: undefined,
    endDate: undefined
  })
  getList()
}

// 处理分页
const handleSizeChange = (val) => {
  queryParams.size = val
  getList()
}

const handleCurrentChange = (val) => {
  queryParams.page = val
  getList()
}

// 查看详情
const handleViewDetail = (row) => {
  selectedReservation.value = row
  detailDialogVisible.value = true
}

// 调整状态
const handleAdjustStatus = async (row) => {
  try {
    await ElMessageBox.confirm('确认将此预约调整为已签到状态？')
    await adjustReservationStatus(row.id)
    ElMessage.success('状态调整成功')
    getList()
  } catch (error) {
    if (!error?.message?.includes('取消')) {
      ElMessage.error(error.response?.data?.message || '状态调整失败')
    }
  }
}

// 删除预约
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除此预约记录？', '警告', {
      type: 'warning'
    })
    await deleteReservation(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    if (!error?.message?.includes('取消')) {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

// 组件挂载时获取数据
onMounted(() => {
  getList()
})
</script>

<style scoped>
.reservation-manage {
  padding: 20px;
}

.filter-bar {
  margin-bottom: 16px;
}

.filter-form {
  margin-bottom: 8px;
}

.advanced-filter {
  margin-top: 10px;
  border: none;

  :deep(.el-collapse-item__header) {
    border: none;
    height: 32px;
    line-height: 32px;
    color: #409eff;
    cursor: pointer;
  }

  :deep(.el-collapse-item__content) {
    padding-bottom: 0;
  }
}

.room-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.seat-number {
  font-size: 12px;
  color: #666;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 13px;
}

.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
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
</style> 