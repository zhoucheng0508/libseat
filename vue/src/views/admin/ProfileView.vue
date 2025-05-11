<template>
  <div class="profile">
    <div class="page-header">
      <h2>个人中心</h2>
    </div>
    <div class="profile-content">
      <div class="profile-card">
        <div class="profile-info">
          <h3>基本信息</h3>
          <div class="info-item">
            <span class="label">管理员账号</span>
            <span class="value">{{ username }}</span>
          </div>
          <div class="info-item">
            <span class="label">管理员ID</span>
            <span class="value">{{ adminId }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间</span>
            <span class="value">{{ createdAt }}</span>
          </div>
          <div class="info-item">
            <span class="label">最近登录</span>
            <span class="value">{{ loginTime }}</span>
          </div>
        </div>
        <div class="profile-actions">
          <button class="action-btn" @click="showChangePassword = true">
            修改密码
          </button>
        </div>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <div v-if="showChangePassword" class="modal-overlay">
      <div class="modal-content">
        <h3>修改密码</h3>
        <div class="form-item">
          <input 
            type="password" 
            v-model="oldPassword" 
            placeholder="输入原密码"
          >
        </div>
        <div class="form-item">
          <input 
            type="password" 
            v-model="newPassword" 
            placeholder="输入新密码"
          >
        </div>
        <div class="form-item">
          <input 
            type="password" 
            v-model="confirmPassword" 
            placeholder="确认新密码"
          >
        </div>
        <div class="modal-actions">
          <button 
            class="cancel-btn" 
            @click="showChangePassword = false"
          >
            取消
          </button>
          <button 
            class="confirm-btn" 
            @click="handleChangePassword"
            :disabled="loading"
          >
            {{ loading ? '修改中...' : '确认修改' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAdminInfo } from '@/api/admin'

const username = ref('')
const adminId = ref('')
const createdAt = ref('')
const loginTime = ref(new Date().toLocaleString())
const showChangePassword = ref(false)
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)

onMounted(async () => {
  try {
    const storedAdminId = localStorage.getItem('adminId')
    if (storedAdminId) {
      const adminInfo = await getAdminInfo(storedAdminId)
      username.value = adminInfo.username
      adminId.value = adminInfo.id
      createdAt.value = new Date(adminInfo.createdAt).toLocaleString()
    }
  } catch (error) {
    console.error('获取管理员信息失败:', error)
  }
})

const handleChangePassword = async () => {
  // TODO: 实现修改密码功能
  loading.value = true
  try {
    if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
      alert('请填写完整信息')
      return
    }
    if (newPassword.value !== confirmPassword.value) {
      alert('两次输入的新密码不一致')
      return
    }
    // await changePassword(oldPassword.value, newPassword.value)
    showChangePassword.value = false
    alert('密码修改成功')
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.profile {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.profile-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
}

.profile-info h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
}

.info-item .label {
  width: 100px;
  color: #666;
  font-size: 14px;
}

.info-item .value {
  color: #333;
  font-size: 14px;
}

.profile-actions {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #1890ff;
  border-radius: 4px;
  background-color: white;
  color: #1890ff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  background-color: #f0f7ff;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  width: 400px;
}

.modal-content h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #333;
}

.form-item {
  margin-bottom: 16px;
}

.form-item input {
  width: 100%;
  padding: 8px;
  border: 1px solid #d9e8f7;
  border-radius: 4px;
  font-size: 14px;
}

.form-item input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  border: 1px solid #d9d9d9;
  background-color: white;
  color: #666;
}

.cancel-btn:hover {
  border-color: #666;
  color: #333;
}

.confirm-btn {
  border: none;
  background-color: #1890ff;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background-color: #40a9ff;
}

.confirm-btn:disabled {
  background-color: #b3d4ff;
  cursor: not-allowed;
}
</style> 