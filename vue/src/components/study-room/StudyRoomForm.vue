<template>
  <div class="study-room-form-overlay" v-if="visible" @click.self="handleClose">
    <div class="study-room-form">
      <div class="form-header">
        <h2>{{ isEdit ? '编辑自习室' : '新增自习室' }}</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <div class="form-body">
        <div class="form-group">
          <label>名称</label>
          <input 
            type="text" 
            v-model="formData.name"
            placeholder="请输入自习室名称"
            :class="{ 'error': errors.name }"
          >
          <span class="error-message" v-if="errors.name">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label>位置</label>
          <input 
            type="text" 
            v-model="formData.location"
            placeholder="请输入自习室位置"
            :class="{ 'error': errors.location }"
          >
          <span class="error-message" v-if="errors.location">{{ errors.location }}</span>
        </div>

        <div class="form-group">
          <label>容量</label>
          <input 
            type="number" 
            v-model="formData.capacity"
            placeholder="请输入座位数量"
            min="1"
            :class="{ 'error': errors.capacity }"
          >
          <span class="error-message" v-if="errors.capacity">{{ errors.capacity }}</span>
        </div>

        <div class="form-group">
          <label>开放时间</label>
          <div class="time-range">
            <input 
              type="time" 
              v-model="formData.openTime"
              :class="{ 'error': errors.openTime }"
            >
            <span>至</span>
            <input 
              type="time" 
              v-model="formData.closeTime"
              :class="{ 'error': errors.closeTime }"
            >
          </div>
          <span class="error-message" v-if="errors.openTime || errors.closeTime">
            {{ errors.openTime || errors.closeTime }}
          </span>
        </div>

        <div class="form-group">
          <label>状态</label>
          <select v-model="formData.status" class="status-select" :class="formData.status">
            <option value="active">正常开放</option>
            <option value="inactive">暂停使用</option>
          </select>
          <span class="status-hint">
            <template v-if="formData.status === 'active'">自习室将对用户开放，用户可以正常预约</template>
            <template v-else-if="formData.status === 'inactive'">自习室将暂停使用，用户无法预约</template>
          </span>
        </div>

        <div class="form-group">
          <label>描述</label>
          <textarea 
            v-model="formData.description"
            placeholder="请输入自习室描述"
            rows="4"
          ></textarea>
        </div>

        <div class="form-group">
          <label>图片</label>
          <div class="image-upload" @click="triggerFileInput">
            <input 
              type="file" 
              ref="fileInput"
              accept="image/*"
              style="display: none"
              @change="handleImageChange"
            >
            <div 
              class="image-preview" 
              :class="{ 'has-image': formData.imageUrl || previewImage }"
            >
              <img 
                v-if="previewImage || formData.imageUrl" 
                :src="previewImage || formData.imageUrl" 
                alt="预览图"
              >
              <div v-else class="upload-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span>点击上传图片</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="submitError" class="submit-error">
        {{ submitError }}
      </div>

      <div class="form-footer">
        <button class="cancel-btn" @click="handleClose" :disabled="submitting">取消</button>
        <button class="submit-btn" @click="handleSubmit" :disabled="submitting">
          <span v-if="submitting" class="loading-spinner small"></span>
          {{ submitting ? '提交中...' : (isEdit ? '保存' : '创建') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { createStudyRoom, updateStudyRoom, uploadStudyRoomImage } from '@/api/studyRoom'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  roomData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'refresh'])

const fileInput = ref(null)
const previewImage = ref('')
const errors = reactive({})
const submitting = ref(false)
const submitError = ref('')

// 表单数据
const formData = reactive({
  name: '',
  location: '',
  capacity: '',
  status: 'active',
  description: '',
  imageUrl: '',
  openTime: '08:00',
  closeTime: '22:00'
})

// 监听编辑数据变化
watch(() => props.roomData, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    // 清空之前的状态
    previewImage.value = ''
    submitError.value = ''
    Object.keys(errors).forEach(key => errors[key] = '')
    
    // 填充表单数据
    Object.assign(formData, {
      name: '',
      location: '',
      capacity: '',
      status: 'active',
      description: '',
      imageUrl: '',
      openTime: '08:00',
      closeTime: '22:00'
    }, newVal)
  }
}, { immediate: true })

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理图片上传
const handleImageChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    // 创建预览URL
    previewImage.value = URL.createObjectURL(file)
    
    // 如果是编辑模式且有roomId，则上传图片
    if (props.roomData?.id) {
      const response = await uploadStudyRoomImage(props.roomData.id, file)
      if (response && response.imageUrl) {
        formData.imageUrl = response.imageUrl
        // 释放预览URL，使用实际上传后的URL
        URL.revokeObjectURL(previewImage.value)
        previewImage.value = response.imageUrl
      }
    } else {
      // 如果是新建模式，保存文件对象以便提交时上传
      formData.imageFile = file
    }
  } catch (error) {
    console.error('图片处理失败:', error)
    ElMessage.error('图片处理失败')
  }
}

// 表单验证
const validateForm = () => {
  errors.name = !formData.name ? '请输入自习室名称' : ''
  errors.location = !formData.location ? '请输入自习室位置' : ''
  errors.capacity = !formData.capacity ? '请输入座位数量' : 
    formData.capacity < 1 ? '座位数量必须大于0' : ''
  errors.openTime = !formData.openTime ? '请选择开放时间' : ''
  errors.closeTime = !formData.closeTime ? '请选择关闭时间' : ''

  if (formData.openTime && formData.closeTime) {
    const start = new Date(`2000/01/01 ${formData.openTime}`)
    const end = new Date(`2000/01/01 ${formData.closeTime}`)
    if (start >= end) {
      errors.closeTime = '关闭时间必须晚于开放时间'
    }
  }

  return !Object.values(errors).some(error => error)
}

// 处理表单提交
const handleSubmit = async () => {
  try {
    // 验证表单
    if (!validateForm()) {
      return
    }
    
    submitting.value = true
    submitError.value = ''
    
    const submitData = {
      name: formData.name,
      location: formData.location,
      capacity: parseInt(formData.capacity),
      status: formData.status,
      description: formData.description,
      openTime: formData.openTime,
      closeTime: formData.closeTime,
      imageUrl: formData.imageUrl
    }

    let finalRoomData = null
    
    // 如果是编辑模式
    if (props.roomData?.id) {
      // 先更新基本信息
      const updateResponse = await updateStudyRoom(props.roomData.id, submitData)
      finalRoomData = updateResponse
      
      // 如果有新图片文件，上传图片
      if (formData.imageFile) {
        try {
          const uploadResponse = await uploadStudyRoomImage(props.roomData.id, formData.imageFile)
          if (uploadResponse && uploadResponse.imageUrl) {
            finalRoomData = uploadResponse
          }
        } catch (error) {
          console.error('图片上传失败:', error)
          ElMessage.warning('图片上传失败，但基本信息已更新')
        }
      }
      
      ElMessage.success('自习室更新成功')
    } else {
      // 创建新自习室
      const createResponse = await createStudyRoom(submitData)
      finalRoomData = createResponse
      
      // 如果有图片文件，上传图片
      if (formData.imageFile) {
        try {
          const uploadResponse = await uploadStudyRoomImage(createResponse.id, formData.imageFile)
          if (uploadResponse && uploadResponse.imageUrl) {
            finalRoomData = uploadResponse
          }
        } catch (error) {
          console.error('图片上传失败:', error)
          ElMessage.warning('图片上传失败，但自习室已创建')
        }
      }
      
      ElMessage.success('自习室创建成功')
    }
    
    // 关闭表单
    emit('update:visible', false)
    // 刷新列表，并传递更新后的数据
    emit('refresh', finalRoomData)
  } catch (error) {
    console.error('提交失败:', error)
    submitError.value = error.message || '提交失败，请重试'
  } finally {
    submitting.value = false
  }
}

// 处理关闭
const handleClose = () => {
  // 如果正在提交，阻止关闭
  if (submitting.value) return
  
  emit('update:visible', false)
  // 重置表单
  Object.assign(formData, {
    name: '',
    location: '',
    capacity: '',
    status: 'active',
    description: '',
    imageUrl: '',
    openTime: '08:00',
    closeTime: '22:00'
  })
  previewImage.value = ''
  submitError.value = ''
  Object.keys(errors).forEach(key => errors[key] = '')
}
</script>

<style scoped>
.study-room-form-overlay {
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

.study-room-form {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.form-header {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.close-btn {
  border: none;
  background: none;
  font-size: 24px;
  color: #909399;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #606266;
}

.form-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group input[type="time"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #409eff;
}

.form-group input.error,
.form-group textarea.error,
.form-group select.error {
  border-color: #f56c6c;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-range input {
  flex: 1;
}

.time-range span {
  color: #909399;
}

.status-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}

.status-select.active {
  color: #67c23a;
}

.status-select.inactive {
  color: #f56c6c;
}

.status-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.image-upload {
  cursor: pointer;
}

.image-preview {
  width: 100%;
  height: 200px;
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  transition: all 0.3s;
}

.image-preview:hover {
  border-color: #409eff;
}

.image-preview.has-image {
  border-style: solid;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #909399;
}

.upload-placeholder svg {
  width: 32px;
  height: 32px;
}

.submit-error {
  margin: 0 20px;
  padding: 8px 12px;
  background-color: #fef0f0;
  color: #f56c6c;
  font-size: 14px;
  border-radius: 4px;
}

.form-footer {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.submit-btn {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  border: 1px solid #dcdfe6;
  background-color: white;
  color: #606266;
}

.cancel-btn:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.submit-btn {
  border: none;
  background-color: #409eff;
  color: white;
}

.submit-btn:hover {
  background-color: #66b1ff;
}

.submit-btn:disabled,
.cancel-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.loading-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
