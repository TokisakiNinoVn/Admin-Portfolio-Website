<template>
  <v-row class="mt-2">
    <!-- Toolbar Sticky -->
    <v-col cols="12" class="toolbar-sticky z-index-10" :class="{ 'toolbar-hidden': isToolbarHidden }">
      <v-card class="mb-2" elevation="2">
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" sm="6" md="3">
              <v-text-field
                v-model="searchQuery"
                label="Tìm kiếm câu hỏi"
                variant="outlined"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6" md="2">
              <VSelect
                v-model="selectedDifficulty"
                :items="DifficultyLevelTypeOptions"
                item-title="title"
                item-value="value"
                label="Độ khó"
                variant="outlined"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6" md="2">
              <VSelect
                v-model="selectedSkill"
                :items="SkillTypeOptions"
                item-title="title"
                item-value="value"
                label="Kỹ năng"
                variant="outlined"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6" md="2">
              <VSelect
                v-model="selectedQuestionType"
                :items="QuestionTypeOptions"
                item-title="title"
                item-value="value"
                label="Loại câu hỏi"
                variant="outlined"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6" md="2">
              <VSelect
                v-model="selectedTopic"
                :items="topics"
                item-title="name"
                item-value="id"
                label="Chủ đề"
                variant="outlined"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6" md="1" class="d-flex justify-end align-center btn-add-question">
              <v-btn color="primary" variant="outlined" @click="dialog = true">
                <i class="fa-solid fa-plus mr-2"></i>
                Thêm
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Loading -->
    <v-col v-if="loading" cols="12" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </v-col>

    <!-- Question List -->
    <template v-else>
      <v-col
        v-for="item in questions"
        :key="item.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card elevation="2" class="d-flex flex-column h-100 topic-card">
          <QuestionCard
            :question="item"
            @view="openQuestionDetail"
            @edit="editQuestion"
            @lesson="openLessonList"
            @delete="openDeleteConfirm"
          />
        </v-card>
      </v-col>
      <v-col v-if="questions.length === 0" cols="12" class="text-center py-8">
        <p class="text-grey">Không tìm thấy câu hỏi nào.</p>
      </v-col>
    </template>

    <!-- Scroll to Top Button -->
    <v-btn
      v-if="showScrollToTop"
      class="scroll-to-top"
      color="primary"
      fab
      small
      @click="scrollToTop"
    >
      <i class="fa-solid fa-arrow-up"></i>
    </v-btn>
  </v-row>

  <!-- Dialog tạo câu hỏi -->
  <QuestionCreateDialog v-model:dialog="dialog" @created="fetchQuestions" />
  <!-- Dialog chỉnh sửa câu hỏi -->
  <QuestionEditDialog
    v-model:dialog="editDialog"
    :question="selectedQuestion"
    @updated="fetchQuestions"
  />

  <!-- Dialog xác nhận xóa -->
  <v-dialog v-model="deleteDialog" max-width="400px">
    <v-card>
      <v-card-title class="text-h6">Xác nhận xóa</v-card-title>
      <v-card-text>
        Bạn có chắc chắn muốn xóa câu hỏi "{{ selectedQuestion?.name }}"?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="deleteDialog = false">Hủy</v-btn>
        <v-btn color="error" variant="text" @click="confirmDelete">Xóa</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <QuestionDetailDialog 
    v-model:dialog="dialogVisible" 
    :question="selectedQuestion" 
    @close="dialogVisible = false"
    @edit="editQuestion"
  />
</template>

<script setup>
import { buildQueryHelper } from '@/helpers/build-query.helper'
import { DifficultyLevelTypeOptions } from '@/helpers/difficulty-level.helper'
import { QuestionTypeOptions } from '@/helpers/question-type.helper'
import { SkillTypeOptions } from '@/helpers/skill-type.helper'
import { useToast } from '@/stores/toast.store'
import { onMounted, onUnmounted, ref, watch } from 'vue'

import QuestionCard from '@/pages/questions/components/QuestionCard.vue'
import QuestionCreateDialog from '@/pages/questions/QuestionCreate.vue'
import QuestionEditDialog from '@/pages/questions/QuestionEdit.vue'
import QuestionService from '@/services/question.service'
import TopicService from '@/services/topic.service'
import QuestionDetailDialog from './QuestionDetail.vue'

// Danh sách câu hỏi và chủ đề
const questions = ref([])
const topics = ref([])
const loading = ref(false)

// Bộ lọc
const searchQuery = ref('')
const selectedDifficulty = ref(null)
const selectedSkill = ref(null)
const selectedQuestionType = ref(null)
const selectedTopic = ref(null)

// Các dialog
const dialog = ref(false)
const editDialog = ref(false)
const detailDialog = ref(false)
const deleteDialog = ref(false)
const dialogVisible = ref(false)
const selectedQuestion = ref(null)

// Scroll & UI
const isToolbarHidden = ref(false)
const showScrollToTop = ref(false)
const lastScrollPosition = ref(0)

const toast = useToast()

// Debounce cho searchQuery
let debounceTimeout = null

// Lấy danh sách chủ đề (cho select)
const fetchTopics = async () => {
  try {
    const response = await TopicService.list()
    topics.value = response.items.map(topic => ({
      id: topic.id,
      name: topic.name,
    }))
  } catch (error) {
    console.error('Error fetching topics:', error)
    toast.show('Không thể tải danh sách chủ đề', 'error')
  }
}

// Lấy danh sách câu hỏi theo bộ lọc
const fetchQuestions = async () => {
  loading.value = true
  try {
    const query = {
      // page: 1,
      // limit: 1000, // Lấy tối đa 1000 câu, có thể điều chỉnh hoặc thêm phân trang sau
      ...(selectedTopic.value && { exam_topic_id: selectedTopic.value }),
      ...(selectedSkill.value && { skill_type: selectedSkill.value }),
      ...(selectedDifficulty.value && { difficulty_level: selectedDifficulty.value }),
      ...(selectedQuestionType.value && { question_type: selectedQuestionType.value }),
      ...(searchQuery.value && { search: searchQuery.value }),
    }
    const response = await QuestionService.list(buildQueryHelper(query))
    questions.value = response.items || []
  } catch (error) {
    console.error('Error fetching questions:', error)
    toast.show('Không thể tải danh sách câu hỏi', 'error')
  } finally {
    loading.value = false
  }
}

// Gọi lại API khi bộ lọc thay đổi (có debounce cho search)
const handleFilterChange = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    fetchQuestions()
  }, 300)
}

watch([selectedDifficulty, selectedSkill, selectedQuestionType, selectedTopic], () => {
  fetchQuestions()
})
watch(searchQuery, () => {
  handleFilterChange()
})

// Các hàm xử lý sự kiện từ QuestionCard
const openQuestionDetail = (question) => {
  selectedQuestion.value = { ...question }
  dialogVisible.value = true
  // console.log(selectedQuestion.value);
}

const openLessonList = (question) => {
  // Nếu có dialog lesson list, mở tại đây. Hiện tại tạm thông báo.
  toast.show('Tính năng đang phát triển', 'info')
}

const openDeleteConfirm = (question) => {
  selectedQuestion.value = { ...question }
  deleteDialog.value = true
}

const confirmDelete = async () => {
  const id = selectedQuestion.value.id
  try {
    await QuestionService.delete(id)
    questions.value = questions.value.filter(q => q.id !== id)
    deleteDialog.value = false
    setTimeout(() => {
      selectedQuestion.value = null
    }, 300)
    toast.show('Xóa câu hỏi thành công!', 'success')
  } catch (error) {
    console.error('Error deleting question:', error)
    toast.show('Xóa câu hỏi thất bại', 'error')
  }
}

const editQuestion = (question) => {
  selectedQuestion.value = { ...question }
  editDialog.value = true
  // console.log(selectedQuestion.value);
}

// Reset selectedQuestion khi các dialog đóng
watch([editDialog, detailDialog, deleteDialog], ([edit, detail, del]) => {
  if (!edit && !detail && !del) {
    setTimeout(() => {
      selectedQuestion.value = null
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
  fetchQuestions()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (debounceTimeout) clearTimeout(debounceTimeout)
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

.btn-add-question .v-btn {
  font-weight: 500;
  font-size: 14px;
  padding: 8px 16px;
}

.btn-add-question .v-btn i {
  margin-right: 8px;
}

@media screen and (max-width: 1024px) {
  .btn-add-question .v-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
