<template>
  <div v-if="show" class="panel-backdrop" @click="closePanel"></div>
  <div class="lesson-list-panel" :class="{ active: show }">
    <div class="panel-container">
      <!-- Left Panel: Lesson List -->
      <div class="panel-content lesson-panel">
        <div class="panel-header">
          <h3>{{ unit?.title }}</h3>
          <button class="close-btn" @click="closePanel">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div class="panel-body">
          <!-- Thanh search tên bài học -->
          <v-text-field
            v-model="searchLesson"
            label="Tìm kiếm bài học"
            prepend-inner-icon="fa-solid fa-search"
            variant="outlined"
            class="search-input"
          ></v-text-field>

          <!-- Nút thêm bài học -->
          <div class="add-lesson-section">
            <v-btn color="primary" @click="showAddLessonDropdown = !showAddLessonDropdown" title="Thêm bài học vào sách">
              <i class="fa-solid fa-plus mr-2"></i>
            </v-btn>
            
            <!-- Dropdown chọn bài học -->
            <div v-if="showAddLessonDropdown" class="lesson-dropdown">
              <div class="dropdown-header">
                <span>Chọn bài học để thêm</span>
              </div>
              <div class="dropdown-list">
                <div 
                  v-for="lesson in filteredLessonList" 
                  :key="lesson.id" 
                  class="dropdown-item"
                  @click="addLesson(lesson)"
                >
                  <div class="lesson-info">
                    <h4>{{ lesson.title }}</h4>
                    <p>{{ lesson.description }}</p>
                  </div>
                </div>
                <div v-if="filteredLessonList.length === 0" class="empty-state">
                  Không có bài học nào phù hợp
                </div>
              </div>
            </div>
          </div>
          
          <!-- Danh sách bài học -->
          <div class="lessons-container">
            <div v-if="lessonListByUnit.length === 0" class="empty-lessons">
              <i class="fa-solid fa-book-open"></i>
              <p>Chưa có bài học nào trong chương này</p>
            </div>
            
            <div v-else class="lesson-list">
              <div v-for="lesson in lessonListByUnit" :key="lesson.id" class="lesson-item" :class="{ 'selected': selectedLessonId === lesson.id }" @click="viewListActivity(lesson.id)">
                <div class="lesson-content">
                  <h4>{{ lesson.title }}</h4>
                  <p>{{ lesson.description }}</p>
                </div>
                <button 
                  class="delete-btn" 
                  @click.stop="confirmRemoveLesson(lesson)"
                  title="Xóa bài học"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
                <button 
                  class="edit-btn" 
                  @click.stop="editLesson(lesson)"
                  title="Sửa bài học"
                >
                  <i class="fa-solid fa-edit"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Activity List -->
      <div v-if="showActivityPanel" class="panel-content activity-panel">
        <div class="panel-header">
          <h3>Danh sách hoạt động</h3>
          <button class="close-btn" @click="closeActivityPanel">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div class="panel-body">
          <!-- Thanh search hoạt động -->
          <v-text-field
            v-model="searchActivity"
            label="Tìm kiếm hoạt động"
            prepend-inner-icon="fa-solid fa-search"
            variant="outlined"
            class="search-input"
          ></v-text-field>

          <!-- Nút thêm hoạt động -->
          <v-btn color="primary" @click="openAddActivityDialog" class="mb-4" title="Thêm hoạt động mới cho bài học">
            <i class="fa-solid fa-plus mr-2"></i>
          </v-btn>

          <!-- Danh sách hoạt động -->
          <div class="activities-container">
            <div v-if="activityList.length === 0" class="empty-activities">
              <i class="fa-solid fa-tasks"></i>
              <p>Chưa có hoạt động nào trong bài học này</p>
            </div>
            
            <div v-else class="activity-list">
              <div v-for="activity in filteredActivityList" :key="activity.id" class="activity-item">
                <div class="activity-content">
                  <h4>{{ activity.title }}</h4>
                  <p>{{ activity.instructions }}</p>
                </div>
                <button 
                  class="edit-btn" 
                  @click="editActivity(activity)"
                  title="Sửa hoạt động"
                >
                  <i class="fa-solid fa-edit"></i>
                </button>
                <button 
                  class="delete-btn" 
                  @click="confirmRemoveActivity(activity)"
                  title="Xóa hoạt động"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <!-- Dialog xác nhận xóa bài học -->
    <v-dialog v-model="deleteLessonDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Xác nhận xóa</v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn xóa bài học "{{ selectedLesson?.title }}" khỏi chương?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="text" @click="deleteLessonDialog = false">Hủy</v-btn>
          <v-btn color="error" variant="text" @click="removeLesson">Xóa</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog xác nhận xóa hoạt động -->
    <v-dialog v-model="deleteActivityDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Xác nhận xóa</v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn xóa hoạt động "{{ selectedActivity?.title }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="text" @click="deleteActivityDialog = false">Hủy</v-btn>
          <v-btn color="error" variant="text" @click="removeActivity">Xóa</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog thêm/sửa hoạt động -->
    <v-dialog v-model="addActivityDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">{{ isEditingActivity ? 'Sửa hoạt động' : 'Thêm hoạt động' }}</v-card-title>
        <v-card-text>
          <v-form ref="activityForm">
            <v-text-field
              v-model="formAddActivity.title"
              label="Tiêu đề hoạt động"
              required
            ></v-text-field>
            <v-textarea
              v-model="formAddActivity.instructions"
              label="Hướng dẫn"
              required
            ></v-textarea>
            <v-text-field
              v-model="formAddActivity.caculated_text"
              label="Nội dung tính toán"
            ></v-text-field>
            <div class="">
              <!-- <img :src="{{ formAddActivity.media_url }}" alt="Ảnh của hoạt động"> -->
            </div>

            <v-file-input
              v-model="formAddActivity.media_url"
              label="Tệp media (jpeg, png, jpg, gif, webp)"
              accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
            ></v-file-input>
            <v-text-field
              v-model.number="formAddActivity.position"
              label="Vị trí"
              type="number"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="text" @click="addActivityDialog = false">Hủy</v-btn>
          <v-btn color="success" variant="text" @click="saveActivity">{{ isEditingActivity ? 'Cập nhật' : 'Thêm' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import {
  createActivityApi,
  deleteActivityApi,
  listActivityApi,
  updateActivityApi
} from '@/apis/modules/activity.api'
import { listLessonApi, listLessonByIdUnitApi } from '@/apis/modules/lesson.api'
import { useToast } from '@/stores/toast.store'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  unit: Object,
  lessons: Array
})

const emit = defineEmits(['update:show', 'add-lesson', 'remove-lesson'])

const toast = useToast()
const showAddLessonDropdown = ref(false)
const deleteLessonDialog = ref(false)
const selectedLesson = ref(null)
const lessonListByUnit = ref([])
const lessonList = ref([])
const showActivityPanel = ref(false)
const selectedLessonId = ref(null)
const activityList = ref([])
const searchLesson = ref('')
const searchActivity = ref('')
const deleteActivityDialog = ref(false)
const selectedActivity = ref(null)
const addActivityDialog = ref(false)
const isEditingActivity = ref(false)

const formAddActivity = ref({
  lesson_id: '',
  title: '',
  instructions: '',
  caculated_text: '',
  media_url: null,
  position: 0
})

const filteredLessonList = computed(() => {
  if (!searchLesson.value) return lessonList.value
  return lessonList.value.filter(lesson =>
    lesson.title.toLowerCase().includes(searchLesson.value.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchLesson.value.toLowerCase())
  )
})

const filteredActivityList = computed(() => {
  if (!searchActivity.value) return activityList.value
  return activityList.value.filter(activity =>
    activity.title.toLowerCase().includes(searchActivity.value.toLowerCase())
  )
})

const closePanel = () => {
  emit('update:show', false)
  showAddLessonDropdown.value = false
  showActivityPanel.value = false
  selectedLessonId.value = null
}

const closeActivityPanel = () => {
  showActivityPanel.value = false
  selectedLessonId.value = null
}

const addLesson = (lesson) => {
  emit('add-lesson', lesson)
  showAddLessonDropdown.value = false
}

const confirmRemoveLesson = (lesson) => {
  selectedLesson.value = lesson
  deleteLessonDialog.value = true
}

const removeLesson = () => {
  if (selectedLesson.value) {
    emit('remove-lesson', selectedLesson.value.id)
    deleteLessonDialog.value = false
    selectedLesson.value = null
  }
}

const viewListActivity = async (lessonId) => {
  selectedLessonId.value = lessonId
  showActivityPanel.value = true
  try {
    const response = await listActivityApi(lessonId)
    activityList.value = response.data.data
  } catch (error) {
    console.error('Error fetching activities:', error)
    toast.error('Không thể tải danh sách hoạt động')
  }
}

const openAddActivityDialog = () => {
  isEditingActivity.value = false
  formAddActivity.value = {
    lesson_id: selectedLessonId.value,
    title: '',
    instructions: '',
    caculated_text: '',
    media_url: null,
    position: activityList.value.length
  }
  addActivityDialog.value = true
}

const editActivity = (activity) => {
  isEditingActivity.value = true
  formAddActivity.value = { ...activity, lesson_id: selectedLessonId.value }
  addActivityDialog.value = true
}

const confirmRemoveActivity = (activity) => {
  selectedActivity.value = activity
  deleteActivityDialog.value = true
}

const removeActivity = async () => {
  if (selectedActivity.value) {
    try {
      await deleteActivityApi(selectedActivity.value.id)
      activityList.value = activityList.value.filter(
        activity => activity.id !== selectedActivity.value.id
      )
      toast.success('Xóa hoạt động thành công')
    } catch (error) {
      console.error('Error deleting activity:', error)
      toast.error('Không thể xóa hoạt động')
    }
    deleteActivityDialog.value = false
    selectedActivity.value = null
  }
}

const saveActivity = async () => {
  try {
    if (isEditingActivity.value) {
      await updateActivityApi(selectedActivity.value.id, formAddActivity.value)
      activityList.value = activityList.value.map(activity =>
        activity.id === selectedActivity.value.id ? { ...activity, ...formAddActivity.value } : activity
      )
      toast.success('Cập nhật hoạt động thành công')
    } else {
      const response = await createActivityApi(formAddActivity.value)
      activityList.value.push(response.data.data)
      toast.success('Thêm hoạt động thành công')
    }
    addActivityDialog.value = false
  } catch (error) {
    console.error('Error saving activity:', error)
    toast.error('Không thể lưu hoạt động')
  }
}

const handleClickOutside = (e) => {
  const addButton = document.querySelector('.add-lesson-section .v-btn')
  const dropdown = document.querySelector('.lesson-dropdown')
  
  if (addButton && !addButton.contains(e.target) && 
      dropdown && !dropdown.contains(e.target)) {
    showAddLessonDropdown.value = false
  }
}

const fetchLessons = async (unitId) => {
  try {
    const response = await listLessonByIdUnitApi(unitId)
    lessonListByUnit.value = response.data.data.map((lesson) => ({
      ...lesson,
      category: lesson.type,
    }))
  } catch (error) {
    console.error('Error fetching lessons:', error)
    toast.error('Không thể tải danh sách bài học')
  }
}

const fetchListLessons = async () => {
  try {
    const response = await listLessonApi()
    lessonList.value = response.data.data
  } catch (error) {
    console.error('Error fetching lessons:', error)
    toast.error('Không thể tải danh sách bài học')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  fetchListLessons()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(
  () => props.unit,
  (newUnit) => {
    if (newUnit?.id) {
      fetchLessons(newUnit.id)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.panel-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(px);
  z-index: 999;
}

.lesson-list-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80vw;
  /* max-width: 900px; */
  height: auto;
  min-height: 700px;
  background: #fff;
  visibility: hidden;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1000;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.lesson-list-panel.active {
  visibility: visible;
  opacity: 1;
}

.panel-container {
  display: flex;
  height: 100%;
  min-height: 700px;
  overflow: hidden;
}

.panel-content {
  /* width: 450px; */
  width: 30%;
  height: 100%;
  min-height: 700px;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.lesson-panel {
  border-right: 1px solid #e0e0e0;
}

.activity-panel {
  /* width: 450px; */
  width: 70%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f5f5f5;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

.panel-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  height: 100%;
}

.search-input {
  margin-bottom: 16px;
}

.add-lesson-section {
  position: relative;
  margin-bottom: 20px;
}

.lesson-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  margin-top: 8px;
}

.dropdown-header {
  padding: 12px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 500;
}

.dropdown-list {
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: #f9f9f9;
}

.lesson-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
}

.lesson-info p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.empty-state {
  padding: 12px;
  text-align: center;
  color: #999;
}

.lessons-container, .activities-container {
  margin-top: 16px;
  overflow-y: scroll;
  height: 600px;
}

.empty-lessons, .empty-activities {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.empty-lessons i, .empty-activities i {
  font-size: 40px;
  margin-bottom: 16px;
  display: block;
}

.lesson-list, .activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lesson-item, .activity-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fafafa;
}

.lesson-item.selected {
  background-color: #e3f2fd;
  border-color: #2196f3;
}

.lesson-content, .activity-content {
  flex: 1;
}

.lesson-content h4, .activity-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
}

.lesson-content p, .activity-content p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.delete-btn, .edit-btn {
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  margin-left: 8px;
}

.edit-btn {
  color: #2196f3;
}

.delete-btn:hover {
  background-color: #ffebee;
}

.edit-btn:hover {
  background-color: #e3f2fd;
}

@media (max-width: 900px) {
  .panel-container {
    flex-direction: column;
  }
  .panel-content {
    width: 100%;
  }
  .activity-panel {
    border-top: 1px solid #e0e0e0;
  }
}
</style>
