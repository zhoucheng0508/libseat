<template>
  <div class="feedback-container">
    <el-tabs v-model="activeTab">
      <!-- 提交反馈标签页 -->
      <el-tab-pane label="提交反馈" name="submit">
        <el-card class="feedback-card">
          <el-form
            ref="feedbackFormRef"
            :model="feedbackForm"
            :rules="feedbackRules"
            label-width="100px"
          >
            <el-form-item label="反馈类型" prop="type">
              <el-radio-group v-model="feedbackForm.type">
                <el-radio label="FEATURE">功能建议</el-radio>
                <el-radio label="BUG">问题反馈</el-radio>
                <el-radio label="COMPLAINT">投诉</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="反馈内容" prop="content">
              <el-input
                v-model="feedbackForm.content"
                type="textarea"
                placeholder="请详细描述您的问题或建议（500字以内）"
                :rows="6"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitFeedback" :loading="submitting">
                提交反馈
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 历史反馈标签页 -->
      <el-tab-pane label="历史反馈" name="history">
        <el-card class="feedback-card">
          <el-table
            :data="feedbackHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
            style="width: 100%"
            v-loading="loading"
          >
            <el-table-column prop="content" label="反馈内容" min-width="200" show-overflow-tooltip />
            <el-table-column prop="type" label="反馈类型" width="120">
              <template #default="scope">
                {{ getFeedbackType(scope.row.type) }}
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
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  @click="showFeedbackDetail(scope.row)"
                >
                  查看详情
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
      </el-tab-pane>
    </el-tabs>

    <!-- 反馈详情对话框 -->
    <el-dialog
      v-model="detailDialog.visible"
      title="反馈详情"
      width="600px"
    >
      <div class="feedback-detail" v-if="detailDialog.data">
        <div class="detail-item">
          <span class="label">反馈类型：</span>
          <span>{{ getFeedbackType(detailDialog.data.type) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">反馈内容：</span>
          <div class="content">{{ detailDialog.data.content }}</div>
        </div>
        <div class="detail-item">
          <span class="label">提交时间：</span>
          <span>{{ formatDate(detailDialog.data.createdAt) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">处理状态：</span>
          <el-tag :type="detailDialog.data.status === '待处理' ? 'warning' : 'success'">
            {{ detailDialog.data.status }}
          </el-tag>
        </div>
        <div class="detail-item" v-if="detailDialog.data.processedAt">
          <span class="label">处理时间：</span>
          <span>{{ formatDate(detailDialog.data.processedAt) }}</span>
        </div>
        <div class="detail-item" v-if="detailDialog.data.processor">
          <span class="label">处理人：</span>
          <span>{{ detailDialog.data.processor.username }}</span>
        </div>
        <div class="detail-item" v-if="detailDialog.data.response">
          <span class="label">回复内容：</span>
          <div class="content">{{ detailDialog.data.response }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { submitFeedback as submitFeedbackApi, getUserFeedbackList, getFeedbackDetail } from '@/api/feedback'

// 标签页激活状态
const activeTab = ref('submit')

// 表单相关
const feedbackFormRef = ref(null)
const submitting = ref(false)
const feedbackForm = ref({
  type: '',
  content: ''
})

const feedbackRules = {
  type: [
    { required: true, message: '请选择反馈类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入反馈内容', trigger: 'blur' },
    { max: 500, message: '内容最多500个字符', trigger: 'blur' }
  ]
}

// 历史记录相关
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const feedbackHistory = ref([])

// 详情对话框
const detailDialog = ref({
  visible: false,
  data: null
})

// 获取反馈类型文本
const getFeedbackType = (type) => {
  const typeMap = {
    'FEATURE': '功能建议',
    'BUG': '问题反馈',
    'COMPLAINT': '投诉'
  }
  return typeMap[type] || type
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

// 提交反馈
const submitFeedback = async () => {
  if (!feedbackFormRef.value) return

  await feedbackFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const userId = localStorage.getItem('userId')
        await submitFeedbackApi({
          user: {
            id: userId
          },
          content: feedbackForm.value.content,
          type: feedbackForm.value.type
        })
        
        ElMessage.success('反馈提交成功')
        feedbackForm.value = {
          type: '',
          content: ''
        }
        // 切换到历史记录标签页并刷新
        activeTab.value = 'history'
        fetchFeedbackHistory()
      } catch (error) {
        console.error('提交反馈失败:', error)
        ElMessage.error(error.message || '提交反馈失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 获取反馈历史
const fetchFeedbackHistory = async () => {
  loading.value = true
  try {
    const userId = localStorage.getItem('userId')
    const response = await getUserFeedbackList(userId)
    feedbackHistory.value = response
    total.value = response.length
  } catch (error) {
    console.error('获取反馈历史失败:', error)
    ElMessage.error(error.message || '获取反馈历史失败')
  } finally {
    loading.value = false
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchFeedbackHistory()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchFeedbackHistory()
}

// 查看详情
const showFeedbackDetail = async (row) => {
  try {
    const response = await getFeedbackDetail(row.id)
    detailDialog.value.data = response
    detailDialog.value.visible = true
  } catch (error) {
    console.error('获取反馈详情失败:', error)
    ElMessage.error(error.message || '获取反馈详情失败')
  }
}

onMounted(() => {
  fetchFeedbackHistory()
})
</script>

<style scoped>
.feedback-container {
  padding: 20px;
}

.feedback-card {
  margin-bottom: 20px;
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
</style> 