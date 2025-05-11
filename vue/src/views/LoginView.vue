<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-left">
        <img src="@/assets/login-illustration.svg" alt="登录插图">
      </div>
      <div class="login-form">
        <div class="login-type">
          <h2>座位预约系统登录</h2>
          <a href="#" @click.prevent="goToAdminLogin" class="admin-link">
            <i class="admin-icon">👤</i>
            管理员入口
          </a>
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div class="form-item">
          <input type="text" v-model="form.username" placeholder="输入账号">
        </div>
        <div class="form-item">
          <input type="password" v-model="form.password" placeholder="输入密码">
        </div>
        <button 
          class="login-btn" 
          @click="handleLogin" 
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '立即登录' }}
        </button>
        <div class="form-footer">
          <div class="register-link">
            <span>没有账号？</span>
            <a href="#" @click.prevent="goToRegister">点此注册</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/user'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const form = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  try {
    error.value = ''
    if (!form.value.username || !form.value.password) {
      error.value = '请输入用户名和密码'
      return
    }
    
    loading.value = true
    const response = await login(form.value.username, form.value.password)
    
    ElMessage.success('登录成功')
    await router.push('/user')
  } catch (error) {
    // 优先使用后端返回的错误信息
    error.value = error.response?.data?.message || error.message
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}

const goToAdminLogin = () => {
  router.push('/admin/login')
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f1f5f9;
  padding: 20px;
}

.login-wrapper {
  display: flex;
  width: 700px;
  height: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.login-left {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  padding: 30px;
}

.login-left img {
  width: 100%;
  max-width: 300px;
  height: auto;
  opacity: 0.9;
}

.login-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 30px;
  background-color: white;
  position: relative;
}

.login-form::before {
  content: '';
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 1px;
  background: linear-gradient(
    to bottom,
    transparent,
    #e5e7eb 20%,
    #e5e7eb 80%,
    transparent
  );
}

.login-type {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.login-type h2 {
  margin-bottom: 0;
}

.admin-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  text-decoration: none;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.admin-link:hover {
  color: #1890ff;
  background-color: #f0f7ff;
}

.admin-icon {
  font-size: 14px;
}

.form-item {
  margin-bottom: 15px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #d9e8f7;
  border-radius: 6px;
  font-size: 13px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.login-btn {
  width: 100%;
  padding: 8px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 8px;
}

.login-btn:hover {
  background-color: #40a9ff;
}

.login-btn:disabled {
  background-color: #b3d4ff;
  cursor: not-allowed;
}

.form-footer {
  margin-top: 15px;
  text-align: center;
  font-size: 12px;
}

.register-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.form-footer span {
  color: #666;
}

.form-footer a {
  color: #1890ff;
  text-decoration: none;
  transition: color 0.3s;
}

.form-footer a:hover {
  color: #40a9ff;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  text-align: center;
  margin-bottom: 15px;
}
</style> 