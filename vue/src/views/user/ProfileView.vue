<template>
  <div class="profile-container">
    <el-card class="profile-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
        </div>
      </template>
      <div class="info-list" v-if="userInfo">
        <div class="info-item">
          <span class="label">用户名：</span>
          <span class="value">{{ userInfo.username }}</span>
        </div>
        <div class="info-item">
          <span class="label">用户ID：</span>
          <span class="value">{{ userInfo.id }}</span>
        </div>
        <div class="info-item">
          <span class="label">未签到次数：</span>
          <span class="value">{{ userInfo.noShowCount || 0 }}</span>
        </div>
        <div class="info-item">
          <span class="label">黑名单状态：</span>
          <span class="value" :class="{ 'text-danger': userInfo.isBlacklisted }">
            {{ userInfo.isBlacklisted ? '已被拉黑' : '正常' }}
          </span>
        </div>
        <div class="info-item" v-if="userInfo.blacklistStartTime">
          <span class="label">拉黑开始时间：</span>
          <span class="value">{{ formatDate(userInfo.blacklistStartTime) }}</span>
        </div>
        <div class="info-item">
          <span class="label">注册时间：</span>
          <span class="value">{{ formatDate(userInfo.createdAt) }}</span>
        </div>
      </div>
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      <div class="actions" v-if="userInfo">
        <el-button type="primary" @click="showChangePasswordDialog">
          修改密码
        </el-button>
      </div>
    </el-card>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialog.visible"
      title="修改密码"
      width="400px"
      @close="resetPasswordForm"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入原密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialog.visible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleChangePassword"
            :loading="passwordDialog.loading"
          >
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserInfo, changePassword } from '@/api/user'

const loading = ref(false)
const userInfo = ref(null)
const error = ref('')

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  error.value = ''
  try {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      throw new Error('未找到用户ID')
    }
    const response = await getUserInfo(userId)
    userInfo.value = response.data || response
  } catch (err) {
    console.error('获取用户信息失败:', err)
    error.value = '获取用户信息失败，请刷新页面重试'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

// 修改密码相关
const passwordDialog = ref({
  visible: false,
  loading: false
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordFormRef = ref(null)

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, max: 20, message: '密码长度必须在8-20位之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const showChangePasswordDialog = () => {
  passwordDialog.value.visible = true
}

const resetPasswordForm = () => {
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  passwordDialog.value.loading = false
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordDialog.value.loading = true
      try {
        const userId = localStorage.getItem('userId')
        await changePassword(
          userId,
          passwordForm.value.oldPassword,
          passwordForm.value.newPassword
        )
        ElMessage.success('密码修改成功')
        passwordDialog.value.visible = false
        resetPasswordForm()
      } catch (error) {
        console.error('修改密码失败:', error)
        ElMessage.error(error.response?.data?.message || '修改密码失败')
      } finally {
        passwordDialog.value.loading = false
      }
    }
  })
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-list {
  padding: 20px 0;
}

.info-item {
  margin-bottom: 15px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.label {
  color: #606266;
  width: 120px;
  text-align: right;
  margin-right: 20px;
}

.value {
  color: #303133;
}

.text-danger {
  color: #f56c6c;
}

.error-message {
  color: #f56c6c;
  text-align: center;
  padding: 20px;
}

.actions {
  margin-top: 20px;
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 