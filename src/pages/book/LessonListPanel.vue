<template>
  <div class="lesson-list-panel" :class="{ active: show }">
    <div class="panel-overlay" @click="closePanel"></div>
    <div class="panel-content">
      <div class="panel-header">
        <h3>Danh sách bài học: {{ unit?.title }}</h3>
        <button class="close-btn" @click="closePanel">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
      
      <div class="panel-body">
        <!-- Nút thêm bài học -->
        <div class="add-lesson-section">
          <v-btn color="primary" @click="showAddLessonDropdown = !showAddLessonDropdown">
            <i class="fa-solid fa-plus mr-2"></i>
            Thêm bài học
          </v-btn>
          
          <!-- Dropdown chọn bài học -->
          <div v-if="showAddLessonDropdown" class="lesson-dropdown">
            <div class="dropdown-header">
              <span>Chọn bài học để thêm</span>
            </div>
            <div class="dropdown-list">
              <div 
                v-for="lesson in lessonList" 
                :key="lesson.id" 
                class="dropdown-item"
                @click="addLesson(lesson)"
              >
                <div class="lesson-info">
                  <h4>{{ lesson.title }}</h4>
                  <p>{{ lesson.description }}</p>
                </div>
              </div>
              <div v-if="lessonList.length === 0" class="empty-state">
                Không có bài học nào khác để thêm
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
            <div v-for="lesson in lessonListByUnit" :key="lesson.id" class="lesson-item">
              <div class="lesson-content">
                <h4>{{ lesson.title }}</h4>
                <p>{{ lesson.description }}</p>
              </div>
              <button 
                class="delete-btn" 
                @click="confirmRemoveLesson(lesson)"
                title="Xóa bài học"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
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
  </div>
</template>

<script setup>
import { listLessonApi, listLessonByIdUnitApi } from '@/apis/modules/lesson.api'
import { useToast } from '@/stores/toast.store'
import { onMounted, onUnmounted, ref } from 'vue'

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
// const unit = ref({})

// Danh sách bài học có sẵn để thêm (trừ những bài đã có trong chương)
// const availableLessons = computed(() => {
//   console.log("list lesson: ", lessonList)
  
//   return lessonList.filter(lesson => 
//     !props.lessons.some(l => l.id === lesson.id)
//   )
// })

const closePanel = () => {
  emit('update:show', false)
  showAddLessonDropdown.value = false
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

// Đóng dropdown khi click bên ngoài
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
  }
}
const fetchListLessons = async () => {
  try {
    const response = await listLessonApi()
    lessonList.value = response.data.data
  } catch (error) {
    console.error('Error fetching lessons:', error)
  }
}


onMounted(() => {
  document.addEventListener('click', handleClickOutside),
  fetchLessons()
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
  { immediate: true } // gọi luôn khi mounted
)

</script>

<style scoped>
.lesson-list-panel {
  position: fixed;
  top: 0;
  right: 0; /* Thay đổi từ left: 0 sang right: 0 */
  width: 100%;
  height: 100%;
  visibility: hidden;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1000;
}

.lesson-list-panel.active {
  visibility: visible;
  opacity: 1;
}

.panel-overlay {
  position: absolute;
  top: 0;
  right: 0; /* Thay đổi từ left: 0 sang right: 0 */
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.panel-content {
  position: absolute;
  top: 0;
  right: 0; /* Thay đổi từ left: 0 sang right: 0 */
  width: 400px;
  height: 100%;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1); /* Đổi shadow sang bên trái */
  transform: translateX(100%); /* Thay đổi từ -100% sang 100% */
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.lesson-list-panel.active .panel-content {
  transform: translateX(0);
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

.lessons-container {
  margin-top: 16px;
}

.empty-lessons {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.empty-lessons i {
  font-size: 40px;
  margin-bottom: 16px;
  display: block;
}

.lesson-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lesson-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fafafa;
}

.lesson-content {
  flex: 1;
}

.lesson-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
}

.lesson-content p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.delete-btn {
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.delete-btn:hover {
  background-color: #ffebee;
}

@media (max-width: 600px) {
  .panel-content {
    width: 100%;
  }
}
</style>
