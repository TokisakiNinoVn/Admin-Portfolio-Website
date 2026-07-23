<template>
  <v-row class="mt-2">
    <!-- Toolbar Sticky -->
    <v-col cols="12" class="toolbar-sticky z-index-10" :class="{ 'toolbar-hidden': isToolbarHidden }">
      <v-card class="mb-2" elevation="2">
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" sm="12" md="3">
              <v-text-field
                v-model="searchQuery"
                label="Tìm kiếm thông báo"
                variant="outlined"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6" md="3" class="d-flex justify-end align-center btn-add-notification">
              <v-btn color="primary" variant="outlined" @click="dialog = true">
                <i class="fa-solid fa-plus mr-2"></i>
                Thêm thông báo mới
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Notification List -->
    <v-col cols="12">
      <div class="notification-container">
        <div v-if="filteredNotifications.length === 0" class="empty-state">
          <i class="fa-regular fa-bell empty-icon"></i>
          <p class="empty-text">Không có thông báo nào</p>
        </div>
        
        <v-list lines="two" class="notification-list" v-else>
          <v-list-item
            v-for="(item, index) in filteredNotifications"
            :key="item.id"
            class="notification-item"
            :class="{
              'notification-item--unread': !item.isRead,
              'notification-item--first': index === 0,
              'notification-item--last': index === filteredNotifications.length - 1
            }"
          >
            <template v-slot:prepend>
              <div class="notification-icon">
                <i class="fa-solid fa-envelope" :class="getNotificationIcon(item)"></i>
              </div>
            </template>
            
            <div class="notification-content">
              <v-list-item-title class="notification-title">{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle class="notification-subtitle">{{ item.content }}</v-list-item-subtitle>
              
              <div class="notification-meta">
                <span class="notification-date">{{ formatDate(item.created_at) }}</span>
                <v-chip v-if="item.type" small class="notification-type" :color="getTypeColor(item.type)">
                  {{ getTypeLabel(item.type) }}
                </v-chip>
              </div>
            </div>
            
            <template v-slot:append>
              <div class="notification-actions">
                <v-btn
                  icon
                  color="primary"
                  variant="text"
                  size="small"
                  class="action-btn"
                  @click="openNotificationDetail(item)"
                >
                  <i class="fa-solid fa-eye"></i>
                  <v-tooltip activator="parent" location="top">Xem chi tiết</v-tooltip>
                </v-btn>
                <v-btn
                  icon
                  color="error"
                  variant="text"
                  size="small"
                  class="action-btn"
                  @click="openDeleteConfirm(item)"
                >
                  <i class="fa-solid fa-trash"></i>
                  <v-tooltip activator="parent" location="top">Xóa thông báo</v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </div>
    </v-col>

    <!-- Scroll to Top Button -->
    <v-btn
      v-if="showScrollToTop"
      class="scroll-to-top"
      color="primary"
      fab
      small
      @click="scrollToTop"
    >
      <i class="fa-solid fa-chevron-up"></i>
    </v-btn>
  </v-row>

  <!-- Dialog tạo thông báo -->
  <v-dialog v-model="dialog" max-width="1000px">
    <v-card>
      <v-card-title class="text-h5 dialog-title">Tạo thông báo mới</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="newNotification.title"
            label="Tiêu đề"
            :rules="[v => !!v || 'Tiêu đề là bắt buộc']"
            required
            variant="outlined"
            class="mb-3"
          ></v-text-field>

          <v-textarea
            v-model="newNotification.content"
            label="Nội dung"
            :rules="[v => !!v || 'Nội dung là bắt buộc']"
            required
            variant="outlined"
            rows="3"
            class="mb-3"
          ></v-textarea>

          <v-select
            v-model="newNotification.type"
            :items="notificationTypes"
            label="Loại thông báo"
            :rules="[v => !!v || 'Loại thông báo là bắt buộc']"
            required
            variant="outlined"
            class="mb-3"
            @update:model-value="handleTypeChange"
          ></v-select>

          <!-- Hiển thị danh sách lớp khi chọn thông báo theo lớp -->
          <div v-if="newNotification.type === 'class'">
            <v-card variant="outlined" class="mb-3">
              <v-card-title class="text-subtitle-1">Chọn lớp</v-card-title>
              <v-card-text>
                <v-autocomplete
                  v-model="selectedClasses"
                  :items="classes"
                  item-title="name"
                  item-value="id"
                  label="Chọn lớp"
                  multiple
                  chips
                  variant="outlined"
                ></v-autocomplete>
              </v-card-text>
            </v-card>
          </div>

          <!-- Hiển thị danh sách học sinh khi chọn thông báo theo học sinh -->
          <div v-if="newNotification.type === 'student'">
            <v-row>
              <v-col cols="6">
                <v-card variant="outlined" class="mb-3 h-100">
                  <v-card-title class="text-subtitle-1">Chọn học sinh</v-card-title>
                  <v-card-text>
                    <v-select
                      v-model="selectedClassForStudents"
                      :items="classes"
                      item-title="name"
                      item-value="id"
                      label="Chọn lớp để hiển thị học sinh"
                      variant="outlined"
                      class="mb-3"
                      @update:model-value="fetchStudentsByClass"
                    ></v-select>
                    
                    <v-text-field
                      v-model="studentSearch"
                      label="Tìm kiếm học sinh"
                      variant="outlined"
                      clearable
                      class="mb-3"
                    ></v-text-field>
                    
                    <v-list class="student-list" style="max-height: 300px; overflow-y: auto;">
                      <v-list-item
                        v-for="student in filteredStudents"
                        :key="student.id"
                      >
                        <template v-slot:prepend>
                          <v-checkbox
                            v-model="selectedStudents"
                            :value="student.id"
                            hide-details
                            :disabled="isStudentSelected(student.id)"
                          ></v-checkbox>
                        </template>
                        <v-list-item-title>{{ student.name }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                    <div v-if="students.length === 0" class="text-center text-grey py-4">
                      Chọn lớp để hiển thị học sinh
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="6">
                <v-card variant="outlined" class="mb-3 h-100">
                  <v-card-title class="text-subtitle-1">Học sinh đã chọn ({{ selectedStudents.length }})</v-card-title>
                  <v-card-text>
                    <v-list v-if="selectedStudents.length > 0" class="selected-students-list" style="max-height: 300px; overflow-y: auto;">
                      <v-list-item
                        v-for="studentId in selectedStudents"
                        :key="studentId"
                      >
                        <template v-slot:prepend>
                          <i class="fa-solid fa-user mr-3"></i>
                        </template>
                        <v-list-item-title>
                          {{ getStudentName(studentId) }}
                        </v-list-item-title>
                        <template v-slot:append>
                          <v-btn
                            icon
                            size="small"
                            variant="text"
                            @click="removeStudent(studentId)"
                          >
                            <i class="fa-solid fa-xmark"></i>
                          </v-btn>
                        </template>
                      </v-list-item>
                    </v-list>
                    <div v-else class="text-center text-grey py-4">
                      Chưa có học sinh nào được chọn
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="dialog = false">Hủy</v-btn>
        <v-btn 
          color="primary" 
          variant="elevated" 
          @click="createNotification"
          :loading="creating"
        >Tạo thông báo</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <NotificationDetail
    v-model:dialog="detailDialog"
    :notification="selectedNotification"
    :types="types"
  />

  <!-- Dialog xem chi tiết -->
  <v-dialog v-model="detailDialog" max-width="600px">
    <v-card class="detail-dialog">
      <v-card-title class="text-h5 dialog-title">{{ selectedNotification?.title }}</v-card-title>
      <v-card-text class="detail-content">
        <div class="detail-section">
          <strong>Nội dung:</strong>
          <p class="detail-text">{{ selectedNotification?.content }}</p>
        </div>
        <div class="detail-meta">
          <p><strong>Đăng bởi:</strong> {{ selectedNotification?.upload_by === 'teacher' ? 'Giáo viên' : 'Hệ thống' }}</p>
          <p><strong>Ngày tạo:</strong> {{ formatDateTime(selectedNotification?.created_at) }}</p>
          <p><strong>Ngày cập nhật:</strong> {{ formatDateTime(selectedNotification?.updated_at) }}</p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="detailDialog = false">Đóng</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog xác nhận xóa -->
  <v-dialog v-model="deleteDialog" max-width="400px">
    <v-card class="delete-dialog">
      <v-card-title class="text-h6 dialog-title">Xác nhận xóa</v-card-title>
      <v-card-text class="delete-content">
        Bạn có chắc chắn muốn xóa thông báo "<strong>{{ selectedNotification?.title }}</strong>"?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="deleteDialog = false">Hủy</v-btn>
        <v-btn color="error" variant="text" @click="confirmDelete">Xóa</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { listClassApi } from '@/apis/modules/class.api'
import { createNotificationApi, deleteNotificationApi, listNotificationApi } from '@/apis/modules/notification.api'
import { listStudentApi } from '@/apis/modules/student.api'
import NotificationDetail from '@/pages/notification/NotificationDetail.vue'
import { useToast } from '@/stores/toast.store'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const notifications = ref([])
const dialog = ref(false)
const editDialog = ref(false)
const detailDialog = ref(false)
const deleteDialog = ref(false)
const selectedNotification = ref(null)
const toast = useToast()
const isToolbarHidden = ref(false)
const showScrollToTop = ref(false)
const lastScrollPosition = ref(0)
const valid = ref(false)
const creating = ref(false)
const form = ref(null)
const studentSearch = ref('')

// Dữ liệu cho thông báo mới
const newNotification = ref({
  title: '',
  content: '',
  type: 'all',
  status: 1
})

// Danh sách lớp và học sinh
const classes = ref([])
const students = ref([])
const allStudents = ref([])
const selectedClasses = ref([])
const selectedStudents = ref([])
const selectedClassForStudents = ref(null)

// Các loại thông báo
const notificationTypes = [
  { title: 'Tất cả học sinh', value: 'all' },
  { title: 'Theo lớp', value: 'class' },
  { title: 'Theo học sinh', value: 'student' }
]

// Thêm type mapping
const typeMap = {
  'all': { label: 'Tất cả', color: 'primary', icon: 'fa-users' },
  'class': { label: 'Theo lớp', color: 'secondary', icon: 'fa-chalkboard-user' },
  'student': { label: 'Theo học sinh', color: 'success', icon: 'fa-user-graduate' }
}

// Lọc thông báo
const searchQuery = ref('')
const filteredNotifications = computed(() => {
  if (!searchQuery.value) return notifications.value
  return notifications.value.filter(notification => 
    notification.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    notification.content.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Lọc học sinh theo từ khóa tìm kiếm
const filteredStudents = computed(() => {
  if (!studentSearch.value) return students.value
  return students.value.filter(student => 
    student.name.toLowerCase().includes(studentSearch.value.toLowerCase())
  )
})

// Fetch danh sách thông báo
const fetchNotifications = async () => {
  try {
    const response = await listNotificationApi()
    notifications.value = response.data.data.map(notification => ({
      ...notification,
      isRead: notification.isRead || false
    }))
  } catch (error) {
    console.error('Error fetching notifications:', error)
    toast.show('Lỗi khi tải thông báo', 'error')
  }
}

// Fetch danh sách lớp
const fetchClasses = async () => {
  try {
    const response = await listClassApi()
    classes.value = response.data.data
  } catch (error) {
    console.error('Error fetching classes:', error)
    toast.show('Lỗi khi tải danh sách lớp', 'error')
  }
}

// Fetch học sinh theo lớp
const fetchStudentsByClass = async (classId) => {
  try {
    const response = await listStudentApi(classId)
    students.value = response.data.data
    
    // Thêm học sinh vào danh sách tổng hợp (nếu chưa có)
    response.data.data.forEach(student => {
      if (!allStudents.value.find(s => s.id === student.id)) {
        allStudents.value.push(student)
      }
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    toast.show('Lỗi khi tải danh sách học sinh', 'error')
  }
}

// Kiểm tra học sinh đã được chọn chưa
const isStudentSelected = (studentId) => {
  return selectedStudents.value.includes(studentId)
}

// Lấy tên học sinh từ ID (tìm trong tất cả học sinh đã tải)
const getStudentName = (studentId) => {
  const student = allStudents.value.find(s => s.id === studentId)
  return student ? student.name : 'Unknown'
}

// Xóa học sinh khỏi danh sách đã chọn
const removeStudent = (studentId) => {
  selectedStudents.value = selectedStudents.value.filter(id => id !== studentId)
}

// Xử lý khi thay đổi loại thông báo
const handleTypeChange = (type) => {
  // Reset các lựa chọn khi thay đổi loại
  if (type !== 'class') {
    selectedClasses.value = []
  }
  if (type !== 'student') {
    selectedStudents.value = []
    selectedClassForStudents.value = null
    students.value = []
    studentSearch.value = ''
  }
}

// Tạo thông báo mới
const createNotification = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  creating.value = true
  
  try {
    // Chuẩn bị dữ liệu scopes theo loại thông báo
    const scopes = []
    
    if (newNotification.value.type === 'all') {
      scopes.push({ type: 'all' })
    } 
    else if (newNotification.value.type === 'class' && selectedClasses.value.length > 0) {
      scopes.push({ 
        type: 'class', 
        targetIds: selectedClasses.value 
      })
    }
    else if (newNotification.value.type === 'student' && selectedStudents.value.length > 0) {
      scopes.push({ 
        type: 'student', 
        targetIds: selectedStudents.value 
      })
    } else {
      toast.show('Vui lòng chọn lớp hoặc học sinh', 'error')
      creating.value = false
      return
    }

    const notificationData = {
      title: newNotification.value.title,
      content: newNotification.value.content,
      status: newNotification.value.status,
      scopes: scopes
    }

    await createNotificationApi(notificationData)
    toast.show('Tạo thông báo thành công', 'success')
    dialog.value = false
    resetForm()
    fetchNotifications()
  } catch (error) {
    console.error('Error creating notification:', error)
    toast.show('Lỗi khi tạo thông báo', 'error')
  } finally {
    creating.value = false
  }
}

// Reset form
const resetForm = () => {
  newNotification.value = {
    title: '',
    content: '',
    type: 'all',
    status: 1
  }
  selectedClasses.value = []
  selectedStudents.value = []
  selectedClassForStudents.value = null
  students.value = []
  studentSearch.value = ''
  allStudents.value = [] // Reset danh sách học sinh tổng hợp
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('vi-VN')
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('vi-VN')
}

// Get type label and color
const getTypeLabel = (type) => {
  return typeMap[type]?.label || type
}

const getTypeColor = (type) => {
  return typeMap[type]?.color || 'primary'
}

const getNotificationIcon = (notification) => {
  return typeMap[notification.type]?.icon || 'fa-envelope'
}

const openNotificationDetail = (notification) => {
  selectedNotification.value = { ...notification }
  detailDialog.value = true
}

const openDeleteConfirm = (notification) => {
  selectedNotification.value = { ...notification }
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await deleteNotificationApi({ id: selectedNotification.value.id })
    notifications.value = notifications.value.filter((notification) => notification.id !== selectedNotification.value.id)
    deleteDialog.value = false
    setTimeout(() => {
      selectedNotification.value = null
    }, 300)
    toast.show('Xóa thông báo thành công!', 'success')
  } catch (error) {
    console.error('Error deleting notification:', error)
    toast.show('Lỗi khi xóa thông báo', 'error')
  }
}

// Reset selectedNotification khi các dialog đóng
watch([editDialog, detailDialog, deleteDialog], ([edit, detail, del]) => {
  if (!edit && !detail && !del) {
    setTimeout(() => {
      selectedNotification.value = null
    }, 300)
  }
})

// Reset form khi đóng dialog tạo mới
watch(dialog, (value) => {
  if (!value) {
    resetForm()
  }
})

const handleScroll = () => {
  const currentScrollPosition = window.pageYOffset
  const isMobileOrTablet = window.innerWidth <= 1024

  // Handle toolbar visibility
  if (isMobileOrTablet) {
    if (currentScrollPosition > lastScrollPosition.value && currentScrollPosition > 100) {
      isToolbarHidden.value = true
    } else {
      isToolbarHidden.value = false
    }
  }

  // Handle scroll-to-top button visibility
  showScrollToTop.value = currentScrollPosition > 300

  lastScrollPosition.value = currentScrollPosition
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  fetchNotifications()
  fetchClasses()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.toolbar-sticky {
  position: sticky;
  top: 0;
  z-index: 10;
  padding-top: 8px;
  transition: transform 0.3s ease;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  margin-bottom: 16px;
}

.toolbar-hidden {
  transform: translateY(-100%);
}

.notification-container {
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9e9e9e;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  font-weight: 500;
}

.notification-list {
  background: transparent;
  gap: 12px;
  display: flex;
  flex-direction: column;
}

.notification-item {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  background: white;
  margin-bottom: 0;
  padding: 16px;
  position: relative;
  overflow: hidden;
}

.notification-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.notification-item:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-color: #667eea;
}

.notification-item:hover::before {
  opacity: 1;
}

.notification-item--unread {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-left: 4px solid #667eea;
}

.notification-item--unread::before {
  opacity: 1;
}

.notification-item--first {
  margin-top: 8px;
}

.notification-item--last {
  margin-bottom: 8px;
}

.notification-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.notification-icon i {
  color: white;
  font-size: 20px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-subtitle {
  color: #5a6c7d;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.notification-date {
  font-size: 12px;
  color: #7f8c8d;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 6px;
}

.notification-type {
  font-size: 11px;
  font-weight: 600;
}

.notification-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  width: 36px;
  height: 36px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: scale(1.1);
  background: #f8f9fa;
}

.btn-add-notification .v-btn {
  font-weight: 600;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-add-notification .v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.scroll-to-top {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.scroll-to-top:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.dialog-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
  border-radius: 8px 8px 0 0;
}

.detail-dialog .v-card-text {
  padding: 24px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-text {
  color: #5a6c7d;
  line-height: 1.6;
  margin-top: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

.detail-meta p {
  margin-bottom: 8px;
  color: #5a6c7d;
}

.delete-dialog .v-card-text {
  padding: 20px 24px;
  font-size: 15px;
  line-height: 1.5;
}

.h-100 {
  height: 100%;
}

/* Responsive design */
@media screen and (max-width: 1024px) {
  .btn-add-notification .v-btn {
    width: 100%;
    justify-content: center;
  }
  
  .notification-item {
    padding: 12px;
  }
  
  .notification-icon {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }
  
  .notification-icon i {
    font-size: 16px;
  }
  
  .notification-title {
    font-size: 15px;
  }
  
  .notification-subtitle {
    font-size: 13px;
  }
  
  .notification-actions {
    flex-direction: column;
    gap: 2px;
  }
}

@media screen and (max-width: 768px) {
  .notification-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .notification-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .notification-content {
    width: 100%;
    margin-bottom: 12px;
  }
  
  .notification-actions {
    flex-direction: row;
    align-self: flex-end;
  }
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notification-item {
  animation: fadeIn 0.5s ease;
}

.notification-item:nth-child(even) {
  animation-delay: 0.1s;
}

/* Custom scrollbar */
.notification-list::-webkit-scrollbar {
  width: 6px;
}

.notification-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}
</style>
