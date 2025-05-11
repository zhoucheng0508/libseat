import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AdminLoginView from '../views/AdminLoginView.vue'
import AdminRegisterView from '../views/AdminRegisterView.vue'
import AdminHomeView from '../views/AdminHomeView.vue'
import UserHomeView from '../views/UserHomeView.vue'
import ReservationView from '../views/user/ReservationView.vue'
import ProfileView from '../views/user/ProfileView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresAuth: false }
  },
  {
    path: '/user',
    name: 'user',
    component: UserHomeView,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'reservation',
        name: 'userReservation',
        component: ReservationView
      },
      {
        path: 'profile',
        name: 'userProfile',
        component: ProfileView
      },
      {
        path: 'my-reservations',
        name: 'myReservations',
        component: () => import('@/views/user/MyReservationsView.vue'),
        meta: {
          title: '我的预约'
        }
      },
      {
        path: 'feedback',
        name: 'UserFeedback',
        component: () => import('@/views/user/FeedbackView.vue'),
        meta: { title: '意见反馈' }
      }
    ]
  },
  {
    path: '/admin/login',
    name: 'adminLogin',
    component: AdminLoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/admin/register',
    name: 'adminRegister',
    component: AdminRegisterView,
    meta: { requiresAuth: false }
  },
  {
    path: '/admin',
    component: AdminHomeView,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/study-rooms'
      },
      {
        path: 'profile',
        name: 'adminProfile',
        component: () => import('../views/admin/ProfileView.vue')
      },
      {
        path: 'study-rooms',
        name: 'studyRooms',
        component: () => import('../views/admin/StudyRoomView.vue')
      },
      {
        path: 'reservations',
        name: 'AdminReservations',
        component: () => import('@/views/admin/ReservationManageView.vue'),
        meta: {
          title: '预约管理'
        }
      },
      {
        path: 'blacklist',
        name: 'adminBlacklist',
        component: () => import('@/views/admin/BlacklistView.vue'),
        meta: { title: '黑名单管理' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/UserManageView.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'feedback',
        name: 'AdminFeedback',
        component: () => import('@/views/admin/FeedbackManageView.vue'),
        meta: { title: '反馈管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userToken = localStorage.getItem('userToken')
  const adminToken = localStorage.getItem('adminToken')
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  
  console.log('路由守卫 - 状态:', {
    userToken: userToken ? '存在' : '不存在',
    adminToken: adminToken ? '存在' : '不存在',
    isAdmin,
    path: to.path
  })

  // 登录相关页面无需验证token
  if (to.path === '/login' || to.path === '/admin/login' || to.path === '/register' || to.path === '/admin/register') {
    // 如果已登录且尝试访问登录页，重定向到对应的首页
    if (isAdmin && adminToken) {
      next('/admin')
      return
    } else if (!isAdmin && userToken) {
      next('/user')
      return
    }
    next()
    return
  }

  // 验证登录状态
  const hasValidToken = isAdmin ? adminToken : userToken
  if (!hasValidToken) {
    console.log('需要登录，重定向到登录页')
    // 根据尝试访问的路径决定重定向到哪个登录页
    if (to.path.startsWith('/admin')) {
      next('/admin/login')
    } else {
      next('/login')
    }
    return
  }

  // 验证管理员权限
  if (to.path.startsWith('/admin') && !isAdmin) {
    console.log('需要管理员权限，重定向到用户主页')
    next('/user')
    return
  }

  next()
})

export default router 