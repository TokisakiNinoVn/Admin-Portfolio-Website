<script setup>
import { getInforAccountApi, updateAccountApi } from '@/apis/modules/account.api'
import { useToast } from '@/stores/toast.store'
import { onMounted, ref } from 'vue'

const toast = useToast()

const userInfor = ref({
  id: null,
  name: '',
  phone: '',
  email: '',
  role: '',
  gender: null,
  school_id: '',
  created_at: '',
  password: '',
  password_confirmation: ''
})

const isEditing = ref(false)
const showSuccessNotification = ref(false)

// Thêm options cho giới tính
const genderOptions = [
  { value: 0, label: 'Nam' },
  { value: 1, label: 'Nữ' },
  { value: 2, label: 'Khác' }
]

const loadInfoAccount = async () => {
  try {
    const response = await getInforAccountApi()
    userInfor.value = response.data.data
  } catch (error) {
    console.error('Error fetching user infor:', error)
    if (error.response) {
      toast.show(error.response.data.message, 'error') 
      console.error('Error fetching user infor:', error.response.data.message)
    }
  }
}

const toggleEdit = () => {
  isEditing.value = !isEditing.value
}

const updateUser = async () => {
  if (userInfor.value.password !== userInfor.value.password_confirmation) {
    toast.show('Mật khẩu xác nhận không khớp!')
    return
  }

  try {
    const payload = {
      id: userInfor.value.id,
      name: userInfor.value.name,
      phone: userInfor.value.phone,
      email: userInfor.value.email,
      role: userInfor.value.role,
      gender: userInfor.value.gender,
      school_id: userInfor.value.school_id,
      password: userInfor.value.password,
      password_confirmation: userInfor.value.password_confirmation
    }

    const res = await updateAccountApi(payload)

    if (res && (res.success || res.status === 200 || res.data)) {
      toast.show('Cập nhật thông tin thành công!', 'success')
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...payload,
          created_at: userInfor.value.created_at
        })
      )
      isEditing.value = false
      
      // Hiển thị thông báo thành công
      showSuccessNotification.value = true
      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        showSuccessNotification.value = false
      }, 3000)
    } else {
      toast.show(res?.message || 'Cập nhật thất bại! Vui lòng thử lại.', 'error')
    }
  } catch (error) {
    toast.show('Cập nhật thất bại! Vui lòng thử lại.', 'error')
    console.error(error)
  }
}

onMounted(() => {
  loadInfoAccount()
})
</script>

<template>
  <div class="profile-container">
    <div class="profile-card">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="avatar">
          {{ userInfor.name ? userInfor.name.charAt(0) : '?' }}
        </div>
        <div>
          <h1 class="profile-name">{{ userInfor.name }}</h1>
          <p class="profile-role">
            {{ userInfor.role === 'teacher' ? 'Giáo viên' : userInfor.role }}
          </p>
        </div>
      </div>

      <!-- Profile Information -->
      <div class="profile-info" v-if="!isEditing">
        <div class="info-item">
          <i class="fas fa-envelope"></i>
          <div>
            <p class="info-label">Email</p>
            <p class="info-value">{{ userInfor.email }}</p>
          </div>
        </div>
        <div class="info-item">
          <i class="fas fa-school"></i>
          <div>
            <p class="info-label">Trường</p>
            <p class="info-value">{{ userInfor.school_id }}</p>
          </div>
        </div>
        <div class="info-item">
          <i class="fas fa-venus-mars"></i>
          <div>
            <p class="info-label">Giới tính</p>
            <p class="info-value">
              {{ userInfor.gender === 0 ? 'Nam' : userInfor.gender === 1 ? 'Nữ' : 'Khác' }}
            </p>
          </div>
        </div>
        <div class="info-item">
          <i class="fas fa-calendar-alt"></i>
          <div>
            <p class="info-label">Ngày tạo tài khoản</p>
            <p class="info-value">
              {{ userInfor.created_at ? new Date(userInfor.created_at).toLocaleDateString('vi-VN') : '' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <div v-if="isEditing" class="edit-form">
        <div class="form-group">
          <label>Họ và tên</label>
          <input v-model="userInfor.name" type="text" placeholder="Nhập họ và tên" />
        </div>
        <div class="form-group">
          <label>Số điện thoại</label>
          <input v-model="userInfor.phone" type="tel" placeholder="Nhập số điện thoại" />
        </div>
        
        <!-- Radio group for gender selection -->
        <div class="form-group">
          <label>Giới tính</label>
          <div class="radio-group">
            <label v-for="option in genderOptions" :key="option.value" class="radio-label">
              <input 
                type="radio" 
                :value="option.value" 
                v-model="userInfor.gender"
                class="radio-input"
              />
              <span class="radio-text">{{ option.label }}</span>
            </label>
          </div>
        </div>
        
        <div class="form-group">
          <label>Mật khẩu mới</label>
          <input v-model="userInfor.password" type="password" placeholder="Nhập mật khẩu mới" />
        </div>
        <div class="form-group">
          <label>Xác nhận mật khẩu</label>
          <input v-model="userInfor.password_confirmation" type="password" placeholder="Xác nhận mật khẩu" />
        </div>
      </div>

      <!-- Buttons -->
      <div class="action-buttons">
        <button class="btn btn-secondary" @click="toggleEdit">
          {{ isEditing ? 'Hủy' : 'Chỉnh sửa' }}
        </button>
        <button v-if="isEditing" class="btn btn-primary" @click="updateUser">
          Cập nhật
        </button>
      </div>
    </div>

    <!-- Success Notification -->
    <Transition name="slide-fade">
      <div v-if="showSuccessNotification" class="success-notification">
        <div class="notification-content">
          <i class="fas fa-check-circle"></i>
          <span>Cập nhật thành công!</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.profile-container {
  min-height: 80vh;
  background: #f4f6f9;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  position: relative;
}

.profile-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  max-width: 420px;
  width: 100%;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.avatar {
  width: 64px;
  height: 64px;
  background: #3b82f6;
  border-radius: 50%;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-name {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.profile-role {
  font-size: 14px;
  color: #666;
  margin: 4px 0 0;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-item i {
  font-size: 18px;
  color: #3b82f6;
}

.info-label {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.info-value {
  font-size: 15px;
  color: #333;
  margin: 0;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #555;
  display: block;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* Radio group styles */
.radio-group {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-input {
  margin-right: 6px;
}

.radio-text {
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 10px 0;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-primary {
  background: #3b82f6;
  color: #fff;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #e5e7eb;
  color: #333;
}

.btn-secondary:hover {
  background: #d1d5db;
}

/* Success Notification Styles */
.success-notification {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  align-items: center;
  animation: fadeInUp 0.3s ease-out;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-content i {
  font-size: 18px;
}

/* Transition animations */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-50%) translateY(20px);
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
