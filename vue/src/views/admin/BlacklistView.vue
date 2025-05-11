<template>
  <div class="blacklist-manage">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>黑名单管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="showAddUserDialog">添加用户</el-button>
            <el-button type="primary" :icon="Refresh" circle @click="getList" />
          </div>
        </div>
      </template>

      <!-- 黑名单用户列表 -->
      <el-table
        v-loading="loading"
        :data="blacklistUsers"
        style="width: 100%"
        :header-cell-style="{
          background: '#f5f7fa',
          color: '#606266'
        }"
      >
        <el-table-column label="用户名" prop="username" width="180" />
        
        <el-table-column label="加入时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.blacklistTime) }}
          </template>
        </el-table-column>

        <el-table-column label="剩余时间" width="180">
          <template #default="{ row }">
            <el-tag :type="getRemainingTimeType(row.remainingTime)">
              {{ formatRemainingTime(row.remainingTime) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="原因" prop="reason" min-width="200" />

        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleRemove(row)"
            >
              移出黑名单
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 无数据提示 -->
      <el-empty v-if="blacklistUsers.length === 0 && !loading" description="暂无黑名单用户" />
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog 
      v-model="addUserDialogVisible" 
      title="添加用户到黑名单" 
      width="500px"
    >
      <el-form :model="addUserForm" label-width="100px">
        <el-form-item label="用户ID" required>
          <el-input v-model="addUserForm.userId" placeholder="请输入用户ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addUserDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddToBlacklist" :loading="addUserLoading">
            确认添加
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getBlacklistUsers, removeFromBlacklist, addToBlacklist } from '@/api/admin/blacklist'

// 加载状态
const loading = ref(false)
// 黑名单用户列表
const blacklistUsers = ref([])

// 添加用户对话框
const addUserDialogVisible = ref(false)
const addUserLoading = ref(false)
const addUserForm = ref({
  userId: ''
})

// 显示添加用户对话框
const showAddUserDialog = () => {
  addUserForm.value.userId = ''
  addUserDialogVisible.value = true
}

// 获取黑名单列表
const getList = async () => {
  loading.value = true
  try {
    const { data } = await getBlacklistUsers()
    blacklistUsers.value = data
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '获取黑名单列表失败')
  } finally {
    loading.value = false
  }
}

// 处理添加用户到黑名单
const handleAddToBlacklist = async () => {
  if (!addUserForm.value.userId.trim()) {
    ElMessage.warning('请输入用户ID')
    return
  }

  addUserLoading.value = true
  try {
    const response = await addToBlacklist(addUserForm.value.userId)
    ElMessage.success(response.message || '已将用户添加到黑名单')
    addUserDialogVisible.value = false
    getList() // 刷新列表
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '添加黑名单失败')
  } finally {
    addUserLoading.value = false
  }
}

// 处理移出黑名单
const handleRemove = async (row) => {
  try {
    await ElMessageBox.confirm(`确认将用户 ${row.username} 从黑名单中移除？`, '提示', {
      type: 'warning'
    })
    await removeFromBlacklist(row.userId)
    ElMessage.success('已将用户移出黑名单')
    getList() // 刷新列表
  } catch (error) {
    if (!error?.message?.includes('取消')) {
      ElMessage.error(error.response?.data?.message || '移出黑名单失败')
    }
  }
}

// 格式化日期时间
const formatDateTime = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化剩余时间
const formatRemainingTime = (ms) => {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) {
    return `${days}天${hours}小时`
  }
  return `${hours}小时`
}

// 获取剩余时间标签类型
const getRemainingTimeType = (ms) => {
  const days = ms / (1000 * 60 * 60 * 24)
  if (days <= 1) return 'danger'
  if (days <= 3) return 'warning'
  return 'info'
}

// 组件挂载时获取数据
onMounted(() => {
  getList()
})
</script>

<style scoped>
.blacklist-manage {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.box-card {
  margin-bottom: 20px;
}
</style> 