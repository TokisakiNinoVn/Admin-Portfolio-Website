<template>
  <v-row class="">
    <!-- Toolbar Sticky -->
    <v-col cols="12" class="toolbar-sticky z-index-10" :class="{ 'toolbar-hidden': isToolbarHidden }">
      <v-card class="mb-2" elevation="2">
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" sm="12" md="3">
              <v-text-field
                v-model="searchQuery"
                label="Tìm kiếm chủ đề"
                variant="outlined"
                clearable
                hide-details
              />
            </v-col>
            <!-- Nút thêm chủ đề -->
            <v-col cols="12" sm="6" md="3" class="d-flex justify-end align-center btn-add-topic">
              <v-btn color="primary" variant="outlined" @click="dialog = true">
                <i class="fa-solid fa-plus mr-2"></i>
                Thêm chủ đề mới
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Topic Cards Grid -->
    <v-col
      v-for="(item, index) in filteredTopics"
      :key="item.id"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <v-card elevation="2" class="d-flex flex-column h-100 topic-card">
        <TopicCard
          :topic="item"
          @view="openTopicDetail"
          @edit="editTopic"
          @lesson="openLessonList"
          @delete="openDeleteConfirm"
        />
      </v-card>
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
      <i class="fa-solid fa-jet-fighter-up"></i>
    </v-btn>
  </v-row>

  <!-- Dialog tạo chủ đề -->
  <TopicCreateDialog v-model:dialog="dialog" @created="fetchTopics" />
  <!-- Dialog chỉnh sửa chủ đề -->
  <TopicEditDialog
    v-model:dialog="editDialog"
    :topic="selectedTopic"
    @updated="fetchTopics"
  />

  <!-- Dialog xem chi tiết (đã sửa theo cấu trúc mới) -->
  <!-- <v-dialog v-model="detailDialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h5">{{ selectedTopic?.name }}</v-card-title>
      <v-card-text>
        <p><strong>Mô tả:</strong> {{ selectedTopic?.description }}</p>
        <p><strong>Số lượng ngân hàng câu hỏi:</strong> {{ selectedTopic?.question_banks_count || 0 }}</p>
        <p><strong>Ngày tạo:</strong> {{ formatDate(selectedTopic?.created_at) }}</p>
        <p><strong>Ngày cập nhật:</strong> {{ formatDate(selectedTopic?.updated_at) }}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="detailDialog = false">Đóng</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog> -->

  <!-- Dialog xác nhận xóa -->
  <v-dialog v-model="deleteDialog" max-width="400px">
    <v-card>
      <v-card-title class="text-h6 bg-primary text-white">Xác nhận xóa</v-card-title>
      <v-card-text>
        Bạn có chắc chắn muốn xóa chủ đề "{{ selectedTopic?.name }}"?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="deleteDialog = false">Hủy</v-btn>
        <v-btn color="error" variant="text" @click="confirmDelete">Xóa</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Component Danh sách bài học (BÊN PHẢI) -->
  <!-- <LessonListPanel
    v-model:show="lessonListVisible"
    :topic="selectedTopic"
    :lessons="demoListLessonOfTopic"
    @add-lesson="addLessonToTopic"
    @remove-lesson="removeLessonFromTopic"
  /> -->

  <!-- Dialog xem chi tiết -->
  <TopicDetailDialog
    v-model:dialog="detailDialog"
    :topic="selectedTopic"
    @close="detailDialog = false"
  />
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { deleteTopicApi, listTopicApi } from '@/apis/modules/topic.api'
// import LessonListPanel from '@/pages/topic/LessonListPanel.vue'
import TopicCreateDialog from '@/pages/topic/TopicCreate.vue'
import TopicDetailDialog from '@/pages/topic/TopicDetail.vue'
import TopicEditDialog from '@/pages/topic/TopicEdit.vue'
import TopicCard from '@/pages/topic/components/TopicCard.vue'
import { useToast } from '@/stores/toast.store'

const topics = ref([])
const searchQuery = ref('')
const dialog = ref(false)
const editDialog = ref(false)
const detailDialog = ref(false)
const deleteDialog = ref(false)
const lessonListVisible = ref(false)
const selectedTopic = ref(null)
const toast = useToast()
const isToolbarHidden = ref(false)
const showScrollToTop = ref(false)
const lastScrollPosition = ref(0)

// Dữ liệu mẫu cho danh sách bài học (có thể thay bằng API thực tế)
const demoListLessonOfTopic = ref([])

// Hàm định dạng ngày tháng
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

// Lọc chủ đề theo từ khóa tìm kiếm (chỉ dựa trên name và description)
const filteredTopics = computed(() => {
  const query = (searchQuery.value || '').toLowerCase()
  if (!query) return topics.value
  return topics.value.filter((topic) => {
    return (
      (topic.name && topic.name.toLowerCase().includes(query)) ||
      (topic.description && topic.description.toLowerCase().includes(query))
    )
  })
})

// Lấy danh sách chủ đề từ API
const fetchTopics = async () => {
  try {
    const response = await listTopicApi()
    if (response.data.length > 0) {
        topics.value = response.data.map((topic) => ({
        id: topic.id,
        name: topic.name,
        description: topic.description,
        question_banks_count: topic.question_banks_count || 0,
        created_at: topic.created_at,
        updated_at: topic.updated_at
      }))
    }
  } catch (error) {
    console.error('Error fetching topics:', error)
    toast.show('Không thể tải danh sách chủ đề', 'error')
  }
}

const openTopicDetail = (topic) => {
  selectedTopic.value = { ...topic }
  detailDialog.value = true
}

const openLessonList = (topic) => {
  selectedTopic.value = { ...topic }
  lessonListVisible.value = true
}

const openDeleteConfirm = (topic) => {
  selectedTopic.value = { ...topic }
  deleteDialog.value = true
}

const confirmDelete = async () => {
  const id = selectedTopic.value.id;
  try {
    await deleteTopicApi(id)
    topics.value = topics.value.filter((topic) => topic.id !== id)
    deleteDialog.value = false
    setTimeout(() => {
      selectedTopic.value = null
    }, 300)
    toast.show('Xóa chủ đề thành công!', 'success')
  } catch (error) {
    console.error('Error deleting topic:', error)
    toast.show('Xóa chủ đề thất bại', 'error')
  }
}

const editTopic = (topic) => {
  selectedTopic.value = { ...topic }
  editDialog.value = true
}

// Thêm bài học vào chủ đề (demo)
const addLessonToTopic = (lesson) => {
  if (!demoListLessonOfTopic.value.some(l => l.id === lesson.id)) {
    demoListLessonOfTopic.value.push(lesson)
    toast.show(`Đã thêm "${lesson.title}" vào chủ đề`, 'success')
  } else {
    toast.show('Bài học đã có trong chủ đề', 'warning')
  }
}

// Xóa bài học khỏi chủ đề (demo)
const removeLessonFromTopic = (lessonId) => {
  const lessonIndex = demoListLessonOfTopic.value.findIndex(l => l.id === lessonId)
  if (lessonIndex !== -1) {
    const removedLesson = demoListLessonOfTopic.value[lessonIndex]
    demoListLessonOfTopic.value.splice(lessonIndex, 1)
    toast.show(`Đã xóa "${removedLesson.title}" khỏi chủ đề`, 'success')
  }
}

// Reset selectedTopic khi các dialog đóng
watch([editDialog, detailDialog, deleteDialog, lessonListVisible], ([edit, detail, del, lessonList]) => {
  if (!edit && !detail && !del && !lessonList) {
    setTimeout(() => {
      selectedTopic.value = null
    }, 300)
  }
})

// Xử lý scroll để ẩn/hiện toolbar và nút lên đầu trang
const handleScroll = () => {
  const currentScrollPosition = window.pageYOffset
  const isMobileOrTablet = window.innerWidth <= 1024

  if (isMobileOrTablet) {
    isToolbarHidden.value = currentScrollPosition > lastScrollPosition.value && currentScrollPosition > 100
  }

  showScrollToTop.value = currentScrollPosition > 300
  lastScrollPosition.value = currentScrollPosition
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  fetchTopics()
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
  transition: transform 0.3s ease;
  z-index: 100;
}

.toolbar-hidden {
  transform: translateY(-100%);
}

.z-index-10 {
  z-index: 10;
}

.scroll-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
}

.topic-card {
  transition: all 0.3s ease;
}

.topic-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.v-card.topic-card {
  margin-bottom: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.v-card.topic-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.btn-add-topic .v-btn {
  font-weight: 500;
  font-size: 14px;
  padding: 8px 16px;
}

.btn-add-topic .v-btn i {
  margin-right: 8px;
}

@media screen and (max-width: 1024px) {
  .btn-add-topic .v-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
