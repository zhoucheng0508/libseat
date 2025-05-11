<template>
  <div class="home-container">
    <header class="header">
      <div class="user-info">
        欢迎，{{ username }}
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </div>
    </header>
    <div class="content">
      <!-- 其他内容 -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserInfo } from '@/api/user'

const router = useRouter()
const username = ref('')

onMounted(async () => {
  try {
    // 首先尝试从 localStorage 获取用户名
    const storedUsername = localStorage.getItem('username')
    const userId = localStorage.getItem('userId')
    
    if (!userId) {
      router.push('/login')
      return
    }

    if (storedUsername) {
      username.value = storedUsername
    } else {
      // 如果没有存储的用户名，则请求用户信息
      const userInfo = await getUserInfo(userId)
      username.value = userInfo.username
      // 存储用户名以备后用
      localStorage.setItem('username', userInfo.username)
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    // 如果获取失败，清除本地存储并返回登录页
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    router.push('/login')
  }
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f1f5f9;
}

.header {
  background-color: white;
  padding: 16px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #333;
}

.logout-btn {
  padding: 4px 12px;
  border: 1px solid #d9e8f7;
  border-radius: 4px;
  background-color: white;
  color: #1890ff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: #f0f7ff;
  border-color: #1890ff;
}

.content {
  padding: 24px;
}
</style> 