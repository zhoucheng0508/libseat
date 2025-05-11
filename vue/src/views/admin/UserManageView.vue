<template>
  <div class="user-manage-container">
    <el-card class="user-manage-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-input
            v-model="searchQuery"
            placeholder="搜索用户名"
            style="width: 200px"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </template>

      <!-- 用户列表表格 -->
      <el-table
        :data="paginatedUsers"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="id" label="用户ID" width="280" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="noShowCount" label="未签到次数" width="100">
          <template #default="scope">
            {{ scope.row.noShowCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="isBlacklisted" label="黑名单状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isBlacklisted ? 'danger' : 'success'">
              {{ scope.row.isBlacklisted ? '已拉黑' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              @click="handleResetPassword(scope.row)"
            >
              重置密码
            </el-button>
            <el-button
              size="small"
              :type="scope.row.isBlacklisted ? 'success' : 'danger'"
              @click="handleBlacklistToggle(scope.row)"
            >
              {{ scope.row.isBlacklisted ? '移出黑名单' : '加入黑名单' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalUsers"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPasswordDialog.visible"
      title="重置用户密码"
      width="400px"
    >
      <el-form
        ref="resetPasswordFormRef"
        :model="resetPasswordForm"
        :rules="resetPasswordRules"
        label-width="100px"
      >
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="resetPasswordForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPasswordDialog.visible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleConfirmResetPassword"
            :loading="resetPasswordDialog.loading"
          >
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllUsers, changeUserPassword } from '@/api/admin'
import { addToBlacklist, removeFromBlacklist } from '@/api/admin/blacklist'

// 数据加载和搜索
const loading = ref(false)
const users = ref([])
const searchQuery = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalUsers = computed(() => filteredUsers.value.length)

// 过滤用户列表
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.id.toString().includes(query)
  )
})

// 分页后的用户列表
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUsers.value.slice(start, end)
})

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await getAllUsers()
    // 直接使用返回的数组
    users.value = response.map(user => ({
      ...user,
      // 确保布尔值的一致性
      isBlacklisted: user.isBlacklisted === true,
      // 确保数值的一致性
      noShowCount: user.noShowCount || 0,
      // 添加未签到次数显示
      missedCheckIns: user.noShowCount || 0
    }))
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 重置密码相关
const resetPasswordDialog = ref({
  visible: false,
  loading: false
})

const resetPasswordForm = ref({
  userId: '',
  newPassword: ''
})

const resetPasswordFormRef = ref(null)

const resetPasswordRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, max: 20, message: '密码长度必须在8-20位之间', trigger: 'blur' }
  ]
}

// 处理重置密码
const handleResetPassword = (user) => {
  resetPasswordForm.value.userId = user.id
  resetPasswordDialog.value.visible = true
}

const handleConfirmResetPassword = async () => {
  if (!resetPasswordFormRef.value) return
  
  await resetPasswordFormRef.value.validate(async (valid) => {
    if (valid) {
      resetPasswordDialog.value.loading = true
      try {
        await changeUserPassword(
          resetPasswordForm.value.userId,
          resetPasswordForm.value.newPassword
        )
        ElMessage.success('密码重置成功')
        resetPasswordDialog.value.visible = false
        resetPasswordForm.value = { userId: '', newPassword: '' }
      } catch (error) {
        console.error('重置密码失败:', error)
        ElMessage.error(error.response?.data?.message || '重置密码失败')
      } finally {
        resetPasswordDialog.value.loading = false
      }
    }
  })
}

// 处理黑名单操作
const handleBlacklistToggle = async (user) => {
  try {
    const action = user.isBlacklisted ? '移出' : '加入'
    await ElMessageBox.confirm(
      `确定要将用户 ${user.username} ${action}黑名单吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const actionFn = user.isBlacklisted ? removeFromBlacklist : addToBlacklist
    await actionFn(user.id)
    
    ElMessage.success(`${action}黑名单成功`)
    // 重新获取用户列表以更新状态
    await fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('黑名单操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

// 处理分页
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 搜索时重置分页
const handleSearch = () => {
  currentPage.value = 1
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-manage-container {
  padding: 20px;
}

.user-manage-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 