import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

// 配置 Element Plus 的消息样式
app.use(ElementPlus, {
  config: {
    // 配置全局属性
    message: {
      max: 1, // 最多显示一个消息
      duration: 2000, // 显示时长
      customClass: 'custom-message', // 自定义类名
    }
  }
})

app.use(router)
app.mount('#app')
