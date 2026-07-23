<template>
  <div v-if="show" class="panel-backdrop" @click="closePanel"></div>
  <div class="question-list-panel" :class="{ active: show }">
    <div class="panel-container">

      <!-- ===== Left Panel: Câu hỏi trong đề thi (1/3) ===== -->
      <div class="panel-content panel-left">
        <div class="panel-header">
          <div class="panel-header-title">
            <!-- <span class="panel-icon">📋</span> -->
            <h3>Câu hỏi trong đề thi</h3>
          </div>
          <button class="close-btn" @click="closePanel" title="Đóng">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <div class="panel-body">
          <v-text-field
            v-model="searchLesson"
            label="Tìm kiếm..."
            prepend-inner-icon="fa-solid fa-search"
            variant="outlined"
            density="compact"
            hide-details
            class="search-input"
          ></v-text-field>

          <div class="d-flex align-center justify-space-between mb-1">
            <div class="question-count-badge mr-3">
              <i class="fa-solid fa-layer-group"></i>
              {{ listQuestionInPaper.length }} câu hỏi
            </div>

            <v-select
              :items="SkillTypeOptions"
              item-title="title"
              item-value="value"
              label="Kỹ năng"
              variant="outlined"
              density="compact"
              :rules="[v => !!v || 'Vui lòng chọn kỹ năng']"
            />

            <v-btn 
              v-if="listQuestionInPaper.length > 0"
              density="default"
              variant="outlined"
              color="error"
              size="small"
              @click="removeAllQuestion"
              class="text-none px-3 ml-3"
            >
              <i class="fa-solid fa-trash mr-1"></i>
              Xóa tất cả
            </v-btn>
          </div>

          <div class="questions-container">
            <div v-if="filteredPaperQuestions.length === 0" class="empty-questions">
              <i class="fa-solid fa-inbox"></i>
              <p>Chưa có câu hỏi nào<br>trong đề thi này</p>
            </div>

            <transition-group name="list" tag="div" class="question-list" v-else>
              <div
                class="question-item paper-item"
                v-for="(question, index) in filteredPaperQuestions"
                :key="question.id"
              >
                <div class="item-index">{{ index + 1 }}</div>
                <div class="question-content">
                  <h4>{{ question.title }}</h4>
                  <p v-if="question.instructions">{{ question.instructions }}</p>
                  <div class="d-flex flex-wrap ga-1 mt-1" v-if="question.question_type || question.difficulty">
                    <v-chip size="x-small" color="primary" variant="tonal">{{ question.question_type }}</v-chip>
                    <v-chip size="x-small" color="warning" variant="tonal" v-if="question.difficulty">{{ question.difficulty }}</v-chip>
                  </div>
                </div>
                <button
                  class="icon-btn danger-btn"
                  @click.stop="confirmRemoveQuestion(question)"
                  @click="removeQuestion(question)"
                  title="Xóa khỏi đề thi"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </transition-group>
          </div>
        </div>

        <div class="panel-footer">
          <v-btn color="primary" variant="flat" @click="saveQuestionOfPaper" block>
            <i class="fa-solid fa-save mr-2"></i>
            Lưu thay đổi
          </v-btn>
        </div>
      </div>

      <!-- ===== Right Panel: Ngân hàng câu hỏi (2/3) ===== -->
      <div class="panel-content panel-right">
        <div class="panel-header">
          <div class="panel-header-title">
            <!-- <span class="panel-icon">🏦</span> -->
            <h3>Ngân hàng câu hỏi</h3>
          </div>
        </div>

        <div class="panel-body">
          <!-- Bộ lọc -->
          <div class="filter-section">
            <v-text-field
              v-model="searchQuestion"
              label="Tìm kiếm câu hỏi..."
              prepend-inner-icon="fa-solid fa-search"
              variant="outlined"
              density="compact"
              hide-details
              class="search-input"
            ></v-text-field>

            <div class="filter-row">
              <VSelect
                v-model="selectedDifficulty"
                :items="DifficultyLevelTypeOptions"
                item-title="title"
                item-value="value"
                label="Độ khó"
                variant="outlined"
                density="compact"
                clearable
                hide-details
              />
              <VSelect
                v-model="selectedSkill"
                :items="SkillTypeOptions"
                item-title="title"
                item-value="value"
                label="Kỹ năng"
                variant="outlined"
                density="compact"
                clearable
                hide-details
              />
              <VSelect
                v-model="selectedQuestionType"
                :items="QuestionTypeOptions"
                item-title="title"
                item-value="value"
                label="Loại câu hỏi"
                variant="outlined"
                density="compact"
                clearable
                hide-details
              />
              <VSelect
                v-model="selectedTopic"
                :items="topics"
                item-title="name"
                item-value="id"
                label="Chủ đề"
                variant="outlined"
                density="compact"
                clearable
                hide-details
              />
              <v-btn
                :color="isFiltering ? 'error' : 'primary'"
                variant="flat"
                @click="toggleFilter"
                size="small"
              >
                <i :class="isFiltering ? 'fa-solid fa-filter-circle-xmark' : 'fa-solid fa-filter'" class="mr-1"></i>
                {{ isFiltering ? 'Hủy lọc' : 'Lọc' }}
              </v-btn>
            </div>
          </div>

          <div class="question-count-badge">
            <i class="fa-solid fa-database"></i>
            {{ filteredQuestionList.length }} câu hỏi
          </div>

          <!-- Danh sách câu hỏi ngân hàng -->
          <div class="questions-container">
            <div v-if="loading" class="empty-questions">
              <v-progress-circular indeterminate color="primary" size="36"></v-progress-circular>
              <p>Đang tải...</p>
            </div>
            <div v-else-if="filteredQuestionList.length === 0" class="empty-questions">
              <i class="fa-solid fa-magnifying-glass"></i>
              <p>Không tìm thấy câu hỏi nào</p>
            </div>

            <div class="question-list" v-else>
              <div
                v-for="(question, index) in filteredQuestionList"
                :key="question.id"
                class="question-item bank-item"
                :class="{ 'already-added': isAlreadyAdded(question.id) }"
              >
                <div class="bank-item-left">
                  <div class="item-index">{{ index + 1 }}</div>
                  <div class="question-content" @click="openQuestionDetail(question)" style="cursor:pointer">
                    <h4>{{ question.title }}</h4>
                    <p v-if="question.instructions">{{ question.instructions }}</p>
                    <div class="d-flex flex-wrap ga-1 mt-1">
                      <v-chip size="x-small" color="info" variant="tonal" v-if="question.question_type">{{ question.question_type }}</v-chip>
                      <v-chip size="x-small" color="warning" variant="tonal" v-if="question.difficulty">{{ question.difficulty }}</v-chip>
                      <v-chip size="x-small" color="success" variant="tonal" v-if="question.subject">{{ question.subject }}</v-chip>
                      <v-chip size="x-small" variant="tonal" v-if="question.points">{{ question.points }} điểm</v-chip>
                    </div>
                  </div>
                </div>
                <div class="bank-item-actions">
                  <button
                    class="icon-btn view-btn"
                    @click.stop="openQuestionDetail(question)"
                    title="Xem chi tiết"
                  >
                    <i class="fa-solid fa-eye"></i>
                  </button>
                  <button
                    class="icon-btn add-btn"
                    @click.stop="addQuestionToLesson(question)"
                    :disabled="isAlreadyAdded(question.id)"
                    :title="isAlreadyAdded(question.id) ? 'Đã thêm vào đề thi' : 'Thêm vào đề thi'"
                  >
                    <i :class="isAlreadyAdded(question.id) ? 'fa-solid fa-check' : 'fa-solid fa-plus'"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Dialog xác nhận xóa câu hỏi khỏi đề ===== -->
    <v-dialog v-model="deleteLessonDialog" max-width="420px">
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center ga-2 pt-5 px-5">
          <v-icon color="error">fa-solid fa-triangle-exclamation</v-icon>
          Xác nhận xóa
        </v-card-title>
        <v-card-text class="px-5">
          Bạn có chắc chắn muốn xóa câu hỏi
          <strong>"{{ selectedLesson?.title }}"</strong> khỏi đề thi?
        </v-card-text>
        <v-card-actions class="px-5 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="deleteLessonDialog = false">Hủy</v-btn>
          <v-btn color="error" variant="flat" @click="removeQuestion">Xóa</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== Dialog xem chi tiết câu hỏi ===== -->
    <v-dialog v-model="dialogVisible" max-width="600px">
      <v-card rounded="lg">
        <v-card-title class="pt-5 px-5">Chi tiết câu hỏi</v-card-title>
        <v-divider />
        <v-card-text class="px-5 py-4">
          <div class="detail-row"><span class="detail-label">Tiêu đề</span><span>{{ selectedQuestion?.title }}</span></div>
          <div class="detail-row"><span class="detail-label">Hướng dẫn</span><span>{{ selectedQuestion?.instructions }}</span></div>
          <div class="detail-row"><span class="detail-label">Mô tả</span><span>{{ selectedQuestion?.description }}</span></div>
          <div class="detail-row"><span class="detail-label">Ngày tạo</span><span>{{ formatDate(selectedQuestion?.created_at) }}</span></div>
          <div class="detail-row"><span class="detail-label">Cập nhật</span><span>{{ formatDate(selectedQuestion?.updated_at) }}</span></div>
        </v-card-text>
        <v-card-actions class="px-5 pb-4">
          <v-spacer />
          <v-btn color="primary" variant="flat" @click="dialogVisible = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { addQuestionToPaperApi } from '@/apis/modules/paper.api'
import { buildQueryHelper } from '@/helpers/build-query.helper'
import { DifficultyLevelTypeOptions } from '@/helpers/difficulty-level.helper'
import { QuestionTypeOptions } from '@/helpers/question-type.helper'
import { SkillTypeOptions } from '@/helpers/skill-type.helper'
import QuestionService from '@/services/question.service'
import TopicService from '@/services/topic.service'
import { useToast } from '@/stores/toast.store'
import { formatDate } from '@/utils/format.util'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  paperId: Number,
  paper: Object,
})

const emit = defineEmits(['update:show', 'add-question', 'remove-question'])
const loading = ref(false)
const toast = useToast()

// ── State ──────────────────────────────────────────────────────────────────
const questions = ref([])
const topics = ref([])
const questionList = ref([])
const listQuestionInPaper = ref([])

const searchLesson = ref('')
const searchQuestion = ref('')

const selectedLesson = ref(null)          // câu hỏi đang chờ xóa khỏi đề
const selectedQuestion = ref(null)        // câu hỏi đang xem chi tiết
const deleteLessonDialog = ref(false)
const dialogVisible = ref(false)

const selectedDifficulty = ref(null)
const selectedSkill = ref(null)
const selectedQuestionType = ref(null)
const selectedTopic = ref(null)
const isFiltering = ref(false)

// ── Computed ───────────────────────────────────────────────────────────────
const filteredPaperQuestions = computed(() => {
  if (!searchLesson.value) return listQuestionInPaper.value
  return listQuestionInPaper.value.filter(q =>
    q.title?.toLowerCase().includes(searchLesson.value.toLowerCase())
  )
})

const filteredQuestionList = computed(() => {
  if (!searchQuestion.value) return questionList.value
  return questionList.value.filter(q =>
    q.title?.toLowerCase().includes(searchQuestion.value.toLowerCase())
  )
})

const isAlreadyAdded = (id) => listQuestionInPaper.value.some(q => q.id === id)

// ── Actions ────────────────────────────────────────────────────────────────
const closePanel = () => {
  emit('update:show', false)
}

const confirmRemoveQuestion = (question) => {
  selectedLesson.value = question
  deleteLessonDialog.value = true
}

// FIX: filter ra khỏi array thay vì chỉ gọi emit
const removeQuestion = () => {
  if (selectedLesson.value) {
    listQuestionInPaper.value = listQuestionInPaper.value.filter(
      q => q.id !== selectedLesson.value.id
    )
    emit('remove-question', selectedLesson.value.id)
    toast.show('Đã xóa câu hỏi khỏi đề thi', 'success')
    deleteLessonDialog.value = false
    selectedLesson.value = null
  }
}
const removeAllQuestion = () => {
  listQuestionInPaper.value = []
  emit('remove-all-questions')
  toast.show('Đã xóa tất cả câu hỏi khỏi đề thi', 'success')
}

const addQuestionToLesson = (question) => {
  if (isAlreadyAdded(question.id)) {
    toast.show('Câu hỏi đã có trong đề thi', 'warning')
    return
  }
  listQuestionInPaper.value.push(question)
  emit('add-question', question)
  toast.show('Thêm câu hỏi vào đề thi thành công', 'success')
}

const openQuestionDetail = (question) => {
  selectedQuestion.value = question
  dialogVisible.value = true
}

const toggleFilter = () => {
  isFiltering.value = !isFiltering.value
  if (!isFiltering.value) {
    clearFilters()
  } else {
    fetchQuestions()
  }
}

const clearFilters = () => {
  isFiltering.value = false
  selectedDifficulty.value = null
  selectedSkill.value = null
  selectedQuestionType.value = null
  selectedTopic.value = null
  fetchQuestions()
}

const saveQuestionOfPaper = async () => {
  try {
    console.log(props.paper)
    const payload = {
      questions: [
        ...listQuestionInPaper.value.map((q, index) => ({
          section_id: props.paper.id,
          question_id: q.id,
          sort_order: index,
        })),
      ],
    }
    console.log(payload)
    toast.show('Thêm câu hỏi vào đề thi thành công', 'success')
    const response = await addQuestionToPaperApi(props.paper.id, payload)
    console.log(response)
  } catch (error) {
    console.error('Error saving question:', error)
    toast.show('Không thể lưu câu hỏi', 'error')
  }
}

// ── API ────────────────────────────────────────────────────────────────────
const fetchTopics = async () => {
  try {
    const response = await TopicService.list()
    topics.value = response.items.map(t => ({ id: t.id, name: t.name }))
  } catch (error) {
    console.error('Error fetching topics:', error)
    toast.show('Không thể tải danh sách chủ đề', 'error')
  }
}

const fetchQuestions = async () => {
  loading.value = true
  try {
    const query = {
      ...(selectedTopic.value && { exam_topic_id: selectedTopic.value }),
      ...(selectedSkill.value && { skill_type: selectedSkill.value }),
      ...(selectedDifficulty.value && { difficulty_level: selectedDifficulty.value }),
      ...(selectedQuestionType.value && { question_type: selectedQuestionType.value }),
    }
    const response = await QuestionService.list(buildQueryHelper(query))
    questions.value = response.items || []
    questionList.value = response.items || []
  } catch (error) {
    console.error('Error fetching questions:', error)
    toast.show('Không thể tải danh sách câu hỏi', 'error')
  } finally {
    loading.value = false
  }
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(() => {
  console.log(props.paper)
  fetchQuestions()
  fetchTopics()
})

watch(
  () => props.paper,
  (newPaper) => {
    if (newPaper?.questions) {
      listQuestionInPaper.value = [...newPaper.questions]
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.search-input {
  display: grid;
  font-size: 0.9375rem;
  font-weight: 400;
  line-height: 1.5;
  flex: 0
}
/* ── Backdrop ── */
.panel-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  z-index: 1004;
}

/* ── Panel wrapper ── */
.question-list-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.97);
  width: 90vw;
  max-width: 1280px;
  height: 86vh;
  background: #f8f9fb;
  visibility: hidden;
  opacity: 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1005;
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.question-list-panel.active {
  visibility: visible;
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

/* ── Layout ── */
.panel-container {
  display: flex;
  height: 100%;
}

.panel-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #fff;
}

/* Left: 1/3 */
.panel-left {
  width: 33.333%;
  border-right: 1px solid #e8eaed;
  background: #fafbfc;
}

/* Right: 2/3 */
.panel-right {
  width: 66.667%;
}

/* ── Panel Header ── */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e8eaed;
  background: #fff;
  flex-shrink: 0;
}

.panel-header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-icon {
  font-size: 20px;
  line-height: 1;
}

.panel-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  letter-spacing: -0.01em;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: 8px;
  color: #888;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.15s, color 0.15s;
}
.close-btn:hover { background: #f0f0f0; color: #333; }

/* ── Panel Body ── */
.panel-body {
  /* flex: 1; */
  padding: 16px 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

/* ── Panel Footer ── */
.panel-footer {
  padding: 12px 20px;
  border-top: 1px solid #e8eaed;
  flex-shrink: 0;
}

/* ── Filter section ── */
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.filter-row > * {
  flex: 1;
  min-width: 130px;
}

.filter-row > .v-btn {
  flex: 0 0 auto;
  min-width: unset;
}

/* ── Count badge ── */
.question-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #5c6bc0;
  background: #ede7f6;
  padding: 4px 10px;
  border-radius: 20px;
  flex-shrink: 0;
  align-self: flex-start;
}

/* ── Questions scroll container ── */
.questions-container {
  /* flex: 1; */
  padding-right: 10px;
  overflow-y: scroll;
  border-radius: 10px;
  /* height: 100%; */
  /* Thin scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #d0d0d0 transparent;
}
.questions-container::-webkit-scrollbar { width: 5px; }
.questions-container::-webkit-scrollbar-thumb { background: #d0d0d0; border-radius: 4px; }

/* ── Empty state ── */
.empty-questions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: #aaa;
  text-align: center;
  gap: 12px;
}
.empty-questions i { font-size: 36px; }
.empty-questions p { margin: 0; font-size: 13px; line-height: 1.6; }

/* ── Question list ── */
.question-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── Question item base ── */
.question-item {
  display: flex;
  align-items: center;

  gap: 10px;
  padding: 12px 14px;
  border: 1px solid #eaecef;
  border-radius: 10px;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.question-item:hover {
  border-color: #c5cae9;
  box-shadow: 0 2px 8px rgba(92, 107, 192, 0.08);
}

/* Left panel items */
.paper-item {
  background: #fafbff;
}
.paper-item:hover {
  border-color: #5c6bc0;
}

/* Bank items */
.bank-item {
  justify-content: space-between;
}

.bank-item.already-added {
  border-color: #a5d6a7;
  background: #f1f8e9;
  opacity: 0.8;
}

.bank-item-left {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.bank-item-actions {
  display: flex;
  /* flex-direction: column; */
  gap: 6px;
  flex-shrink: 0;
}

/* ── Item index pill ── */
.item-index {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: #e8eaf6;
  color: #5c6bc0;
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

/* ── Question content ── */
.question-content {
  flex: 1;
  min-width: 0;
}

.question-content h4 {
  margin: 0 0 3px 0;
  font-size: 13px;
  font-weight: 600;
  color: #2d2d2d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.question-content p {
  margin: 0;
  font-size: 12px;
  color: #777;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Icon buttons ── */
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
  flex-shrink: 0;
}

.view-btn {
  background: #e3f2fd;
  color: #1976d2;
}
.view-btn:hover { background: #bbdefb; }

.add-btn {
  background: #e8f5e9;
  color: #388e3c;
}
.add-btn:hover:not(:disabled) { background: #c8e6c9; }
.add-btn:disabled {
  background: #f5f5f5;
  color: #aaa;
  cursor: not-allowed;
}

.danger-btn {
  background: #fce4ec;
  color: #e53935;
}
.danger-btn:hover { background: #f8bbd0; }

/* ── Detail dialog ── */
.detail-row {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}
.detail-row:last-child { border-bottom: none; }
.detail-label {
  flex-shrink: 0;
  width: 90px;
  font-weight: 600;
  color: #666;
}

/* ── List transition ── */
.list-enter-active, .list-leave-active {
  transition: all 0.25s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(12px);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .question-list-panel {
    width: 98vw;
    height: 95vh;
    border-radius: 12px;
  }
  .panel-container {
    flex-direction: column;
  }
  .panel-left, .panel-right {
    width: 100%;
    height: 50%;
  }
  .panel-left {
    border-right: none;
    border-bottom: 1px solid #e8eaed;
  }
  .filter-row > * {
    min-width: 100px;
  }
}
</style>
