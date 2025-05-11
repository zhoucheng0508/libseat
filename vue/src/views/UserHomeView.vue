<template>
  <div class="user-container">
    <!-- 顶部导航栏 -->
    <header class="header" :class="{ 'header-hidden': isHeaderHidden }">
      <div class="header-content">
        <h1 class="title">座位预约系统</h1>
        <div class="user-info">
          <span class="welcome">欢迎，{{ username }}</span>
          <button class="logout-btn" @click="handleLogout">退出登录</button>
        </div>
      </div>
    </header>

    <div class="main-container">
      <!-- 左侧菜单 -->
      <aside class="sidebar">
        <div class="menu">
          <router-link 
            to="/user/reservation" 
            class="menu-item"
            :class="{ active: currentPath === '/user/reservation' }"
          >
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span>自习室预约</span>
          </router-link>

          <router-link 
            to="/user/my-reservations" 
            class="menu-item"
            :class="{ active: currentPath === '/user/my-reservations' }"
          >
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <span>我的预约</span>
          </router-link>

          <router-link 
            to="/user/profile" 
            class="menu-item"
            :class="{ active: currentPath === '/user/profile' }"
          >
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>个人中心</span>
          </router-link>

          <router-link 
            to="/user/feedback" 
            class="menu-item"
            :class="{ active: currentPath === '/user/feedback' }"
          >
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <span>意见反馈</span>
          </router-link>
        </div>
      </aside>

      <!-- 主要内容区域 -->
      <main class="main-content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getUserInfo } from '@/api/user'

const router = useRouter()
const route = useRoute()
const username = ref('')
const currentPath = computed(() => route.path)

const isHeaderHidden = ref(false)
let lastScrollTop = 0

const handleScroll = () => {
  const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop
  isHeaderHidden.value = currentScrollTop > lastScrollTop && currentScrollTop > 64
  lastScrollTop = currentScrollTop
}

onMounted(async () => {
  try {
    // 从 localStorage 获取用户信息
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
      localStorage.setItem('username', userInfo.username)
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    handleLogout()
  }

  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const handleLogout = () => {
  // 清除所有登录相关的信息
  localStorage.clear()  // 清除所有存储的数据
  router.push('/login')
}
</script>

<style scoped>
.user-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f1f5f9;
}

.header {
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.header-hidden {
  transform: translateY(-100%);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  color: #333;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.welcome {
  font-size: 14px;
  color: #666;
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

.main-container {
  display: flex;
  margin-top: 64px;
  min-height: calc(100vh - 64px);
}

.sidebar {
  width: 200px;
  background-color: white;
  border-right: 1px solid #e5e7eb;
  position: fixed;
  top: 64px;
  bottom: 0;
  left: 0;
  overflow-y: auto;
}

.menu {
  padding: 16px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s;
  gap: 12px;
}

.menu-item:hover {
  color: #1890ff;
  background-color: #f0f7ff;
}

.menu-item.active {
  color: #1890ff;
  background-color: #e6f4ff;
  border-right: 2px solid #1890ff;
}

.menu-icon {
  width: 20px;
  height: 20px;
}

.main-content {
  flex: 1;
  margin-left: 200px;
  padding: 24px;
  background-color: #f1f5f9;
}
</style> 