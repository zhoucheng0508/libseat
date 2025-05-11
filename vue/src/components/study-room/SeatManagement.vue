<template>
  <div class="seat-management">
    <div class="header">
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="输入座位号查询"
          prefix-icon="el-icon-search"
          clearable
        />
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>
      <div class="operation-buttons">
        <el-button type="primary" @click="handleAddSeat">新增座位</el-button>
        <el-popconfirm
          title="确定要删除该自习室的所有座位吗？此操作不可恢复！"
          @confirm="async () => {
            try {
              await deleteAllSeats(props.roomId)
              ElMessage.success('已删除所有座位')
              refreshSeats()
            } catch (error) {
              ElMessage.error('删除失败')
            }
          }"
        >
          <template #reference>
            <el-button type="danger">删除所有座位</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <el-table
      :data="filteredSeats"
      style="width: 100%; margin-top: 20px;"
      v-loading="loading"
      :header-cell-style="{
        background: '#f5f7fa',
        color: '#606266',
        height: '50px',
        'font-size': '14px'
      }"
    >
      <el-table-column
        prop="seatNumber"
        label="座位号"
        align="center"
        min-width="120"
      />
      <el-table-column
        prop="studyRoomName"
        label="所属自习室"
        align="center"
        min-width="150"
      />
      <el-table-column
        prop="status"
        label="状态"
        align="center"
        min-width="100"
      >
        <template #default="{ row }">
          <el-tag :type="row.status === '可用' ? 'success' : 'warning'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        min-width="250"
        fixed="right"
      >
        <template #default="{ row }">
          <div class="operation-buttons-cell">
            <el-button
              type="primary"
              link
              @click="handleEdit(row)"
            >
              修改
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[5, 10, 20, 30]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增座位对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '修改座位' : '新增座位'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="座位号" prop="seatNumber">
          <el-input 
            v-model="form.seatNumber" 
            placeholder="请输入座位号"
            :disabled="isEdit" 
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="可用" value="可用" />
            <el-option label="不可用" value="不可用" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { getStudyRoomSeats, addSeat, deleteSeat, updateSeatStatus, deleteAllSeats } from '@/api/seat'

const props = defineProps({
  roomId: {
    type: [String, Number],
    required: true
  }
})

const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const dialogVisible = ref(false)
const seats = ref([])
const form = ref({
  seatNumber: '',
  status: '可用',
  description: ''
})

const rules = {
  seatNumber: [
    { required: true, message: '请输入座位号', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 状态映射（英文 -> 中文，用于显示）
const statusMapToCn = {
  'AVAILABLE': '可用',
  'UNAVAILABLE': '不可用',
  'available': '可用',
  'unavailable': '不可用'
}

// 状态映射（中文 -> 英文，用于API请求）
const statusMapToEn = {
  '可用': 'AVAILABLE',
  '不可用': 'UNAVAILABLE'
}

const isEdit = ref(false)
const currentSeatId = ref(null)

// 过滤后的座位列表
const filteredSeats = computed(() => {
  let result = seats.value
  if (searchQuery.value) {
    result = result.filter(seat => 
      seat.seatNumber.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  // 按座位号数字大小排序
  result = result.sort((a, b) => {
    // 提取座位号中的数字部分
    const numA = parseInt(a.seatNumber.replace(/\D/g, ''))
    const numB = parseInt(b.seatNumber.replace(/\D/g, ''))
    return numA - numB
  })
  
  // 分页处理
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  total.value = result.length
  return result.slice(start, end)
})

// 刷新座位列表
const refreshSeats = async () => {
  try {
    loading.value = true
    const response = await getStudyRoomSeats(props.roomId)
    seats.value = (response || []).map(seat => ({
      ...seat,
      status: statusMapToCn[seat.status] || seat.status
    }))
    total.value = seats.value.length
  } catch (error) {
    console.error('获取座位列表失败:', error)
    ElMessage.error('获取座位列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 处理新增座位
const handleAddSeat = () => {
  isEdit.value = false
  currentSeatId.value = null
  form.value = {
    seatNumber: '',
    status: '可用'
  }
  dialogVisible.value = true
}

// 处理编辑座位
const handleEdit = (row) => {
  isEdit.value = true
  currentSeatId.value = row.id
  form.value = {
    seatNumber: row.seatNumber,
    status: row.status
  }
  dialogVisible.value = true
}

// 处理删除座位
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除座位 ${row.seatNumber} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await deleteSeat(row.id)
    ElMessage.success('删除成功')
    refreshSeats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除座位失败:', error)
      ElMessage.error('删除座位失败')
    }
  }
}

// 处理表单提交
const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      // 修改座位状态，转换为英文
      await updateSeatStatus(currentSeatId.value, statusMapToEn[form.value.status])
      ElMessage.success('修改成功')
    } else {
      // 新增座位
      const submitData = {
        seatNumber: form.value.seatNumber,
        studyRoomId: props.roomId,
        status: statusMapToEn[form.value.status]
      }
      await addSeat(submitData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    refreshSeats()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error(error.response?.data?.message || '操作失败')
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

// 组件挂载时获取座位列表
onMounted(() => {
  refreshSeats()
})
</script>

<style scoped>
.seat-management {
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  width: 100%;
}

.search-box {
  display: flex;
  gap: 10px;
}

.operation-buttons {
  display: flex;
  gap: 10px;
}

.operation-buttons-cell {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  width: 100% !important;
}

:deep(.el-table__header) {
  width: 100% !important;
}

:deep(.el-table__body) {
  width: 100% !important;
}

:deep(.el-input) {
  width: 200px;
}
</style> 