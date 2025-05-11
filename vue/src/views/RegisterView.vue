<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-left">
        <img src="@/assets/login-illustration.svg" alt="注册插图">
      </div>
      <div class="login-form">
        <h2>座位预约系统注册</h2>
        <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>
        <div class="form-item">
          <input type="text" v-model="username" placeholder="输入账号">
        </div>
        <div class="form-item">
          <input type="password" v-model="password" placeholder="输入密码">
        </div>
        <div class="form-item">
          <input type="password" v-model="confirmPassword" placeholder="确认密码">
        </div>
        <button 
          class="login-btn" 
          @click="handleRegister" 
          :disabled="loading"
        >
          {{ loading ? '注册中...' : '立即注册' }}
        </button>
        <div class="form-footer">
          <span>已有账号？</span>
          <a href="#" @click.prevent="goToLogin">点此登录</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/api/user'

const router = useRouter()
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const loading = ref(false)

const handleRegister = async () => {
  try {
    errorMsg.value = ''
    if (!username.value || !password.value || !confirmPassword.value) {
      errorMsg.value = '请填写完整信息'
      return
    }
    if (password.value !== confirmPassword.value) {
      errorMsg.value = '两次输入的密码不一致'
      return
    }
    loading.value = true
    await register(username.value, password.value)
    router.push('/login')
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
/* 复用登录页面的样式 */
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

h2 {
  margin-bottom: 20px;
  text-align: center;
  font-size: 16px;
  color: #333;
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

.form-footer {
  margin-top: 15px;
  text-align: center;
  font-size: 12px;
}

.form-footer span {
  color: #666;
}

.form-footer a {
  color: #1890ff;
  text-decoration: none;
  margin-left: 4px;
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