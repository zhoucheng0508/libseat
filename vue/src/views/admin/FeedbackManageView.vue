<template>
  <div class="feedback-manage-container">
    <el-card class="feedback-manage-card">
      <!-- 筛选栏 -->
      <div class="filter-container">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="反馈类型" class="filter-item">
            <el-select v-model="filterForm.type" placeholder="全部类型" clearable>
              <el-option
                v-for="item in feedbackTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="处理状态" class="filter-item">
            <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
              <el-option
                v-for="item in statusTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词" class="filter-item">
            <el-input
              v-model="filterForm.keyword"
              placeholder="搜索标题"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 反馈列表 -->
      <el-table
        :data="feedbackList"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="content" label="反馈内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="反馈类型" width="120">
          <template #default="scope">
            {{ getFeedbackType(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column label="提交用户" width="120">
          <template #default="scope">
            {{ scope.row.user?.username }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="处理状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '待处理' ? 'warning' : 'success'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button
              link
              type="primary"
              @click="handleReply(scope.row)"
            >
              {{ scope.row.status === '待处理' ? '处理' : '查看' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 反馈处理对话框 -->
    <el-dialog
      v-model="replyDialog.visible"
      :title="replyDialog.data?.status === '待处理' ? '处理反馈' : '反馈详情'"
      width="600px"
    >
      <div class="feedback-detail" v-if="replyDialog.data">
        <div class="detail-item">
          <span class="label">反馈类型：</span>
          <span>{{ getFeedbackType(replyDialog.data.type) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">提交用户：</span>
          <span>{{ replyDialog.data.user?.username }}</span>
        </div>
        <div class="detail-item">
          <span class="label">反馈内容：</span>
          <div class="content">{{ replyDialog.data.content }}</div>
        </div>
        <div class="detail-item">
          <span class="label">提交时间：</span>
          <span>{{ formatDate(replyDialog.data.createdAt) }}</span>
        </div>
        <div class="detail-item" v-if="replyDialog.data.processedAt">
          <span class="label">处理时间：</span>
          <span>{{ formatDate(replyDialog.data.processedAt) }}</span>
        </div>
        <div class="detail-item" v-if="replyDialog.data.processor">
          <span class="label">处理人：</span>
          <span>{{ replyDialog.data.processor.username }}</span>
        </div>
        
        <el-form
          v-if="replyDialog.data.status === '待处理'"
          ref="replyFormRef"
          :model="replyForm"
          :rules="replyRules"
        >
          <el-form-item label="回复内容" prop="reply">
            <el-input
              v-model="replyForm.reply"
              type="textarea"
              :rows="4"
              placeholder="请输入回复内容"
            />
          </el-form-item>
        </el-form>

        <div class="detail-item" v-else-if="replyDialog.data.reply">
          <span class="label">回复内容：</span>
          <div class="content">{{ replyDialog.data.reply }}</div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="replyDialog.visible = false">
            {{ replyDialog.data?.status === '待处理' ? '取消' : '关闭' }}
          </el-button>
          <el-button
            v-if="replyDialog.data?.status === '待处理'"
            type="primary"
            @click="submitReply"
            :loading="replyDialog.loading"
          >
            提交回复
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getFeedbackList, processFeedback } from '@/api/admin/feedback'

// 反馈类型选项
const feedbackTypes = [
  { value: 'FEATURE', label: '功能建议' },
  { value: 'BUG', label: '问题反馈' },
  { value: 'COMPLAINT', label: '投诉' }
]

// 状态类型选项
const statusTypes = [
  { value: '待处理', label: '待处理' },
  { value: '已处理', label: '已处理' }
]

// 筛选表单
const filterForm = ref({
  type: '',
  status: '',
  keyword: ''
})

// 列表数据
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const feedbackList = ref([])

// 回复对话框
const replyDialog = ref({
  visible: false,
  loading: false,
  data: null
})

const replyForm = ref({
  reply: ''
})

const replyFormRef = ref(null)

const replyRules = {
  reply: [
    { required: true, message: '请输入回复内容', trigger: 'blur' }
  ]
}

// 获取反馈类型文本
const getFeedbackType = (type) => {
  const found = feedbackTypes.find(item => item.value === type)
  return found ? found.label : type
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

// 获取反馈列表
const fetchFeedbackList = async () => {
  loading.value = true
  try {
    const response = await getFeedbackList()
    let filteredData = response
    
    // 应用筛选
    if (filterForm.value.type) {
      filteredData = filteredData.filter(item => item.type === filterForm.value.type)
    }
    if (filterForm.value.status) {
      filteredData = filteredData.filter(item => 
        (item.status === '已处理') === (filterForm.value.status === '已处理')
      )
    }
    if (filterForm.value.keyword) {
      const keyword = filterForm.value.keyword.toLowerCase()
      filteredData = filteredData.filter(item => 
        item.content.toLowerCase().includes(keyword)
      )
    }

    total.value = filteredData.length
    feedbackList.value = filteredData.slice(
      (currentPage.value - 1) * pageSize.value,
      currentPage.value * pageSize.value
    )
  } catch (error) {
    console.error('获取反馈列表失败:', error)
    ElMessage.error(error.message || '获取反馈列表失败')
  } finally {
    loading.value = false
  }
}

// 处理筛选
const handleSearch = () => {
  currentPage.value = 1
  fetchFeedbackList()
}

const resetFilter = () => {
  filterForm.value = {
    type: '',
    status: '',
    keyword: ''
  }
  handleSearch()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchFeedbackList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchFeedbackList()
}

// 处理回复
const handleReply = (row) => {
  replyDialog.value.data = row
  replyDialog.value.visible = true
  if (row.status === '待处理') {
    replyForm.value.reply = ''
  }
}

// 提交回复
const submitReply = async () => {
  if (!replyFormRef.value) return

  await replyFormRef.value.validate(async (valid) => {
    if (valid) {
      replyDialog.value.loading = true
      try {
        await processFeedback({
          feedbackId: replyDialog.value.data.id,
          processorId: localStorage.getItem('adminId'),
          response: replyForm.value.reply
        })
        ElMessage.success('回复提交成功')
        replyDialog.value.visible = false
        // 刷新列表
        fetchFeedbackList()
      } catch (error) {
        console.error('提交回复失败:', error)
        ElMessage.error(error.message || '提交回复失败')
      } finally {
        replyDialog.value.loading = false
      }
    }
  })
}

onMounted(() => {
  fetchFeedbackList()
})
</script>

<style scoped>
.feedback-manage-container {
  padding: 20px;
}

.feedback-manage-card {
  margin-bottom: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

/* 修改筛选栏样式 */
:deep(.el-form-item) {
  margin-right: 12px;
}

:deep(.el-select) {
  width: 140px;
}

:deep(.el-input) {
  width: 180px;
}

:deep(.el-select .el-input__wrapper) {
  width: 100%;
}

:deep(.el-select .el-input__inner) {
  width: 100%;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.feedback-detail {
  padding: 10px;
}

.detail-item {
  margin-bottom: 15px;
}

.detail-item .label {
  color: #606266;
  margin-right: 10px;
  font-weight: bold;
}

.detail-item .content {
  margin-top: 8px;
  white-space: pre-wrap;
  line-height: 1.5;
  color: #303133;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 