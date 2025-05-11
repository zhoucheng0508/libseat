<template>
  <div class="admin-container">
    <!-- 顶部导航栏 -->
    <header class="header" :class="{ 'header-hidden': isHeaderHidden }">
      <div class="header-content">
        <h1 class="title">座位预约系统管理后台</h1>
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
            to="/admin/study-rooms" 
            class="menu-item"
            :class="{ active: currentPath === '/admin/study-rooms' }"
          >
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span>自习室</span>
          </router-link>

          <router-link 
            to="/admin/reservations" 
            class="menu-item"
            :class="{ active: currentPath === '/admin/reservations' }"
          >
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>预约管理</span>
          </router-link>

          <router-link 
            to="/admin/users" 
            class="menu-item"
            :class="{ active: currentPath === '/admin/users' }"
          >
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>用户管理</span>
          </router-link>

          <router-link
            to="/admin/blacklist"
            class="menu-item"
            :class="{ active: currentPath === '/admin/blacklist' }"
          >
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>黑名单管理</span>
          </router-link>

          <router-link
            to="/admin/feedback"
            class="menu-item"
            :class="{ active: currentPath === '/admin/feedback' }"
          >
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
              />
            </svg>
            <span>反馈管理</span>
          </router-link>

          <router-link 
            to="/admin/profile" 
            class="menu-item"
            :class="{ active: currentPath === '/admin/profile' }"
          >
            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>个人中心</span>
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
import { getAdminInfo } from '@/api/admin'

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
    // 打印所有 localStorage 的内容
    console.log('localStorage 当前内容:', {
      adminToken: localStorage.getItem('adminToken'),
      adminId: localStorage.getItem('adminId'),
      username: localStorage.getItem('username'),
      isAdmin: localStorage.getItem('isAdmin')
    })
    
    const storedAdminId = localStorage.getItem('adminId')
    console.log('storedAdminId:', storedAdminId)
    
    if (!storedAdminId) {
      console.log('未找到管理员ID，跳转到登录页')
      router.push('/admin/login')
      return
    }
    
    console.log('开始获取管理员信息，ID:', storedAdminId)
    const adminInfo = await getAdminInfo(storedAdminId)
    username.value = adminInfo.username
    console.log('获取管理员信息成功:', adminInfo)
  } catch (error) {
    console.error('获取管理员信息失败:', error)
    handleLogout()
  }

  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const handleLogout = () => {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminId')
  localStorage.removeItem('username')
  localStorage.removeItem('isAdmin')
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-container {
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
  padding-top: 64px;
  flex: 1;
}

.sidebar {
  width: 160px;
  background-color: white;
  border-right: 1px solid #e5e7eb;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow-y: auto;
  padding-top: 64px;
  transition: padding-top 0.3s ease;
}

.header-hidden + .main-container .sidebar {
  padding-top: 0;
}

.menu {
  padding: 16px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 14px;
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
  width: 16px;
  height: 16px;
  margin-right: 8px;
  transition: color 0.3s;
}

.main-content {
  flex: 1;
  margin-left: 160px;
  padding: 24px;
  min-height: calc(100vh - 64px);
  width: calc(100% - 160px);
}
</style> 