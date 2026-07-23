<template>
  <v-navigation-drawer
    v-model="show"
    location="right"
    :width="drawerWidth"
    temporary
    style="position: fixed; height: 100vh;"
  >
    <v-card class="h-100 d-flex flex-column">
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between bg-primary text-white">
        <span>Danh sách hoạt động: {{ lesson?.title ?? "Lỗi gì đó" }}</span>
        <v-btn icon @click="show = false" variant="text" size="small" color="white">
          <i class="fa-solid fa-xmark"></i>
        </v-btn>
      </v-card-title>
      
      <div class="main-panel">
        <div class="py-5 pl-3 pr-3">
          <v-row>
            <v-col cols="8">
              <v-text-field
                v-model="searchActivityQuery"
                label="Tìm kiếm hoạt động"
                variant="outlined"
                clearable
                hide-details
                density="compact"
              />
            </v-col>
            <v-col cols="4" class="text-right">
              <v-btn color="primary" @click="openCreateActivityDialog">
                <i class="fa-solid fa-plus mr-1"></i> Thêm mới
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <!-- Danh sách activities dạng card -->
        <v-card-text class="flex-grow-1 activity-list-container py-0">
          <v-row v-if="filteredActivities.length > 0">
            <v-col
              v-for="activity in filteredActivities"
              :key="activity.id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card class="activity-card" elevation="2">
                <!-- Ảnh activity -->
                <v-img
                  v-if="activity.media_url"
                  :src="activity.media_url"
                  height="150px"
                  cover
                  class="activity-image"
                ></v-img>
                <v-img
                  v-else
                  src="https://via.placeholder.com/300x150?text=No+Image"
                  height="150px"
                  cover
                  class="activity-image grey lighten-2"
                ></v-img>
                
                <!-- Nội dung card -->
                <v-card-title class="text-subtitle-1 font-weight-bold">{{ activity.title }}</v-card-title>
                <v-card-text class="py-1">
                  <p class="text-caption text-truncate">{{ truncateDescription(activity.instructions) }}</p>
                  <!-- <p class="text-caption text-grey">Vị trí: {{ activity.position }}</p> -->
                </v-card-text>
                
                <!-- Actions -->
                <v-card-actions class="justify-end">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    @click="editActivity(activity)"
                    title="Sửa hoạt động"
                  >
                    <i class="fa-solid fa-pen text-primary"></i>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    @click="deleteActivity(activity)"
                    title="Xóa hoạt động"
                  >
                    <i class="fa-solid fa-trash text-error"></i>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <!-- Empty state -->
          <div v-else class="text-center py-10">
            <i class="fa-solid fa-inbox fs-40 text-grey-lighten-1 mb-3"></i>
            <p class="text-grey">Không có hoạt động nào</p>
          </div>
        </v-card-text>
      </div>
    </v-card>
  </v-navigation-drawer>

  <!-- Dialog thêm/sửa activity -->
  <v-dialog v-model="activityDialog" max-width="800px">
    <v-card>
      <v-card-title>
        {{ isEditingActivity ? 'Chỉnh sửa hoạt động' : 'Thêm hoạt động mới' }}
      </v-card-title>
      <v-card-text>
        <v-form v-model="validActivityForm" ref="activityForm">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="currentActivity.title"
                label="Tiêu đề *"
                :rules="[v => !!v || 'Tiêu đề là bắt buộc']"
                variant="outlined"
                required
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="currentActivity.instructions"
                label="Hướng dẫn"
                variant="outlined"
                rows="3"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="currentActivity.caculated_text"
                label="Văn bản tính toán"
                variant="outlined"
                rows="3"
              />
            </v-col>
            <v-col cols="12">
              <v-file-input
                :key="fileInputKey"
                v-model="mediaFile"
                :label="isEditingActivity ? 'Thay đổi ảnh (để trống nếu giữ nguyên)' : 'Tải lên ảnh *'"
                :rules="!isEditingActivity ? [v => !!v || 'Ảnh là bắt buộc'] : []"
                variant="outlined"
                accept="image/*"
                prepend-icon=""
                prepend-inner-icon="mdi-camera"
                show-size
                @update:model-value="handleFileSelect"
              ></v-file-input>
              
              <!-- Xem trước ảnh -->
              <div v-if="imagePreview" class="image-preview mt-3">
                <p class="text-caption">Xem trước:</p>
                <v-img :src="imagePreview" max-height="150" contain class="rounded"></v-img>
              </div>
              <div v-else-if="currentActivity.media_url" class="image-preview mt-3">
                <p class="text-caption">Ảnh hiện tại:</p>
                <v-img :src="currentActivity.media_url" max-height="150" contain class="rounded"></v-img>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="currentActivity.position"
                label="Vị trí"
                type="number"
                variant="outlined"
                min="1"
              />
            </v-col>
          </v-row>
        </v-form>
        <small class="text-caption text-grey">*Trường bắt buộc</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="activityDialog = false">Hủy</v-btn>
        <v-btn 
          color="primary" 
          variant="flat" 
          @click="saveActivity"
          :loading="savingActivity"
          :disabled="!validActivityForm"
        >
          {{ isEditingActivity ? 'Cập nhật' : 'Thêm mới' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog xác nhận xóa activity -->
  <v-dialog v-model="deleteActivityDialog" max-width="400px">
    <v-card>
      <v-card-title class="text-h6">Xác nhận xóa</v-card-title>
      <v-card-text>
        Bạn có chắc chắn muốn xóa hoạt động "{{ currentActivity?.title }}"?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="deleteActivityDialog = false">Hủy</v-btn>
        <v-btn color="error" variant="text" @click="confirmDeleteActivity">Xóa</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {
  createActivityApi,
  deleteActivityApi,
  listActivityByIdUnitApi,
  updateActivityApi
} from '@/apis/modules/activity.api'
import { useToast } from '@/stores/toast.store'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  lesson: Object
})

const emit = defineEmits(['update:show'])

const toast = useToast()
const drawerWidth = computed(() => Math.min(window.innerWidth * 0.8, 1200))
const show = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

// Data for activities
const activities = ref([])
const searchActivityQuery = ref('')
const activityDialog = ref(false)
const deleteActivityDialog = ref(false)
const currentActivity = ref({})
const isEditingActivity = ref(false)
const validActivityForm = ref(false)
const savingActivity = ref(false)
const mediaFile = ref(null)
const imagePreview = ref(null)
const fileInputKey = ref(0)
const activityForm = ref(null)

// Filter activities based on search query
const filteredActivities = computed(() => {
  if (!searchActivityQuery.value) return activities.value
  
  return activities.value.filter(activity => 
    activity.title.toLowerCase().includes(searchActivityQuery.value.toLowerCase()) ||
    (activity.instructions && activity.instructions.toLowerCase().includes(searchActivityQuery.value.toLowerCase()))
  )
})

// Watch for lesson changes to load activities
watch(() => props.lesson, async (newLesson) => {
  if (newLesson && newLesson.id) {
    await fetchActivities(newLesson.id)
  }
}, { immediate: true })

// Fetch activities for the selected lesson
const fetchActivities = async (lessonId) => {
  try {
    const response = await listActivityByIdUnitApi(lessonId)
    activities.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching activities:', error)
    activities.value = []
  }
}

// Handle file selection
const handleFileSelect = (file) => {
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    imagePreview.value = null
  }
}


// Reset form and file input
const resetForm = () => {
  mediaFile.value = null
  imagePreview.value = null
  fileInputKey.value++ // Force re-render file input
}

// Open dialog to create new activity
const openCreateActivityDialog = () => {
  currentActivity.value = {
    lesson_id: props.lesson.id,
    title: '',
    instructions: '',
    caculated_text: '',
    position: activities.value.length + 1,
    media_url: null,
  }
  isEditingActivity.value = false
  resetForm()
  activityDialog.value = true
}

// Edit an activity
const editActivity = (activity) => {
  currentActivity.value = { ...activity }
  isEditingActivity.value = true
  resetForm()
  activityDialog.value = true
}

// Delete an activity
const deleteActivity = (activity) => {
  currentActivity.value = { ...activity }
  deleteActivityDialog.value = true
}

// Confirm delete activity
const confirmDeleteActivity = async () => {
  try {
    await deleteActivityApi({ activity_id: currentActivity.value.id })
    activities.value = activities.value.filter(a => a.id !== currentActivity.value.id)
    deleteActivityDialog.value = false
    toast.show('Xóa hoạt động thành công!', 'success')
  } catch (error) {
    console.error('Error deleting activity:', error)
    toast.show('Có lỗi xảy ra khi xóa hoạt động', 'error')
  }
}

// Save activity (create or update)
const saveActivity = async () => {
  // Validate form
  const { valid } = await activityForm.value.validate()
  if (!valid) return
  
  savingActivity.value = true
  try {
    // Prepare data with FormData for file upload
    const formData = new FormData()
    
    if (isEditingActivity.value) {
      // For update, include activity_id
      formData.append('activity_id', currentActivity.value.id)
    }
    
    formData.append('title', currentActivity.value.title)
    formData.append('instructions', currentActivity.value.instructions || '')
    formData.append('caculated_text', currentActivity.value.caculated_text || '')
    formData.append('position', currentActivity.value.position.toString())
    formData.append('lesson_id', props.lesson.id)
    
    // Add media file if selected
    if (mediaFile.value) {
      formData.append('media_url', mediaFile.value)
    } else if (!isEditingActivity.value) {
      toast.show('Vui lòng chọn ảnh cho hoạt động', 'error')
      savingActivity.value = false
      return
    }

    
    if (isEditingActivity.value) {
      await updateActivityApi(formData)
      // Refresh the activities list to get updated data
      await fetchActivities(props.lesson.id)
      toast.show('Cập nhật hoạt động thành công!', 'success')
    } else {
      const response = await createActivityApi(formData)
      activities.value.push(response.data.data)
      toast.show('Thêm hoạt động thành công!', 'success')
    }
    
    activityDialog.value = false
    resetForm()
  } catch (error) {
    console.error('Error saving activity:', error)
    toast.show('Có lỗi xảy ra khi lưu hoạt động', 'error')
  } finally {
    savingActivity.value = false
  }
}

// Helper functions
const truncateDescription = (text, length = 60) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}
</script>

<style scoped>
.main-panel {
  background-color: #f5f5f5; /* Màu nền xám nhẹ */
  height: 100%;
}

.activity-list-container {
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.activity-card {
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  background-color: white; /* Đảm bảo card có nền trắng để nổi bật */
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15) !important;
}

.activity-image {
  border-bottom: 1px solid #e0e0e0;
}

.image-preview {
  border: 1px dashed #ccc;
  padding: 10px;
  border-radius: 4px;
}

.z-index-10 {
  z-index: 10;
}
</style>
