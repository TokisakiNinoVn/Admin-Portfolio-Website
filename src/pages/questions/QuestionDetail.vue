<template>
  <v-dialog v-model="localDialog" max-width="1000px" scrollable>
    <v-card class="question-detail-dialog" rounded="lg">
      <!-- Header -->
      <v-card-title class="d-flex justify-space-between align-center text-h5 py-4 px-6">
        <span class="font-weight-bold">{{ question?.title || 'Chi tiết câu hỏi' }}</span>
        <v-chip :color="statusColor" :text="statusLabel" size="small" variant="flat" />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-row>
          <!-- Cột trái -->
          <v-col cols="12" md="6">
            <!-- Thông tin cơ bản -->
            <div class="section-title mb-3">
              <span class="text-subtitle-1 font-weight-medium">Thông tin chung</span>
            </div>
            <v-row dense>
              <v-col cols="6">
                <div class="info-item">
                  <div class="text-caption text-grey-darken-1">Kỹ năng</div>
                  <div class="font-weight-medium">{{ skillTypeLabel }}</div>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="info-item">
                  <div class="text-caption text-grey-darken-1">Loại câu hỏi</div>
                  <div class="font-weight-medium">{{ questionTypeLabel }}</div>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="info-item">
                  <div class="text-caption text-grey-darken-1">Độ khó</div>
                  <div class="font-weight-medium">{{ difficultyLabel }}</div>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="info-item">
                  <div class="text-caption text-grey-darken-1">Điểm</div>
                  <div class="font-weight-medium">{{ question?.score ?? '—' }}</div>
                </div>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- Chủ đề -->
            <div v-if="question?.topic" class="mb-4">
              <div class="section-title mb-2">
                <span class="text-subtitle-2 font-weight-medium">Chủ đề</span>
              </div>
              <v-sheet variant="outlined" rounded="md" class="pa-3 bg-grey-lighten-5">
                <div><strong>{{ question.topic.name }}</strong></div>
                <div v-if="question.topic.description" class="text-caption text-grey-darken-1 mt-1">
                  {{ question.topic.description }}
                </div>
              </v-sheet>
            </div>

            <!-- Hướng dẫn -->
            <div v-if="question?.instruction" class="mb-4">
              <div class="section-title mb-2">
                <v-icon icon="mdi-information-outline" size="small" class="mr-2 text-primary" />
                <span class="text-subtitle-2 font-weight-medium">Hướng dẫn</span>
              </div>
              <div class="content-block pa-3 rounded-md bg-grey-lighten-5">
                {{ question.instruction }}
              </div>
            </div>

            <!-- Đoạn văn -->
            <div v-if="question?.passage_content" class="mb-4">
              <div class="section-title mb-2">
                <v-icon icon="mdi-text-box-outline" size="small" class="mr-2 text-primary" />
                <span class="text-subtitle-2 font-weight-medium">Đoạn văn</span>
              </div>
              <div class="content-block pa-3 rounded-md bg-grey-lighten-5">
                {{ question.passage_content }}
              </div>
            </div>

            <!-- Giải thích đáp án -->
            <div v-if="question?.answer_explanation" class="mb-4">
              <div class="section-title mb-2">
                <span class="text-subtitle-2 font-weight-medium">Giải thích đáp án</span>
              </div>
              <div class="content-block pa-3 rounded-md bg-grey-lighten-5">
                {{ question.answer_explanation }}
              </div>
            </div>
            
          </v-col>

          <!-- Cột phải -->
          <v-col cols="12" md="6">
            <!-- Hình ảnh -->
            <div v-if="question?.image_url" class="mb-4">
              <div class="section-title mb-2">
                  <i class="fa-solid fa-image mr-2"></i>
                <span class="text-subtitle-2 font-weight-medium">Hình ảnh</span>
              </div>
              <v-img :src="question.image_url" aspect-ratio="16/9" cover rounded="md" class="border" />
            </div>
            <!-- Audio -->
            <div v-if="question?.audio_url" class="mb-4">
              <div class="section-title mb-2">
                  <i class="fa-solid fa-music mr-2"></i>
                <span class="text-subtitle-2 font-weight-medium">Âm thanh</span>
              </div>
              <audio controls :src="question.audio_url" class="w-100 rounded-md" />
              <div v-if="hasListeningSettings" class="text-caption text-grey-darken-1 mt-2 d-flex flex-wrap gap-2">
                <span v-if="question.listening_play_limit !== null">🔁 Giới hạn phát: {{ question.listening_play_limit }} lần</span>
                <span v-if="question.listening_lock_seek !== null">⏸️ Khóa tua: {{ question.listening_lock_seek ? 'Có' : 'Không' }}</span>
                <span v-if="question.listening_auto_next !== undefined">⏩ Tự động chuyển: {{ question.listening_auto_next ? 'Có' : 'Không' }}</span>
              </div>
            </div>

            <!-- Speaking -->
            <div v-if="hasSpeakingSettings" class="mb-4">
              <!-- <div class="section-title mb-2">
                <v-icon icon="mdi-microphone-outline" size="small" class="mr-2 text-primary" />
                <span class="text-subtitle-2 font-weight-medium">Nói</span>
              </div> -->
              <v-chip-group>
                <v-chip variant="outlined" size="small">
                  Chuẩn bị: {{ question.speaking_prepare_seconds ?? 0 }} giây
                </v-chip>
                <v-chip variant="outlined" size="small">
                  Trả lời: {{ question.speaking_answer_seconds ?? 0 }} giây
                </v-chip>
              </v-chip-group>
            </div>

            <v-divider class="my-4" />

            <!-- Thời gian -->
            <div>
              <!-- <div class="section-title mb-2">
                <v-icon icon="mdi-calendar-clock" size="small" class="mr-2 text-primary" />
                <span class="text-subtitle-2 font-weight-medium">Thời gian</span>
              </div> -->
              <v-row>
                <v-col cols="12" md="6">
                  <div class="info-item mb-2">
                    <div class="text-caption text-grey-darken-1">Ngày tạo</div>
                    <div>{{ formattedCreatedAt }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="info-item">
                    <div class="text-caption text-grey-darken-1">Ngày cập nhật</div>
                    <div>{{ formattedUpdatedAt }}</div>
                  </div>
                </v-col>
              </v-row>
              <!-- <div class="info-item mb-2">
                <div class="text-caption text-grey-darken-1">Ngày tạo</div>
                <div>{{ formattedCreatedAt }}</div>
              </div>
              <div class="info-item">
                <div class="text-caption text-grey-darken-1">Ngày cập nhật</div>
                <div>{{ formattedUpdatedAt }}</div>
              </div> -->
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="primary" variant="tonal" rounded="pill" @click="close">Đóng</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  dialog: { type: Boolean, default: false },
  question: { type: Object, default: null }
})
const emit = defineEmits(['update:dialog'])

const localDialog = ref(props.dialog)
watch(() => props.dialog, (v) => (localDialog.value = v))
watch(localDialog, (v) => emit('update:dialog', v))

const skillTypeLabel = computed(() => {
  const map = { reading: 'Đọc', listening: 'Nghe', writing: 'Viết', speaking: 'Nói' }
  return map[props.question?.skill_type] || props.question?.skill_type || '—'
})

const questionTypeLabel = computed(() => {
  const map = { sentence_rewrite: 'Viết lại câu', mcq: 'Trắc nghiệm', essay: 'Tự luận', fill_blank: 'Điền từ', read_aloud: 'Đọc to', recording: 'Ghi âm' }
  return map[props.question?.question_type] || props.question?.question_type || '—'
})

const difficultyLabel = computed(() => {
  const map = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' }
  return map[props.question?.difficulty_level] || props.question?.difficulty_level || '—'
})

// const statusLabel = computed(() => {
//   return props.question?.status === 1 ? 'Hoạt động' : 'Không hoạt động'
// })

const statusColor = computed(() => {
  return props.question?.status === 1 ? 'success' : 'grey'
})

const formattedCreatedAt = computed(() => {
  if (!props.question?.created_at) return '—'
  return new Date(props.question.created_at).toLocaleString()
})

const formattedUpdatedAt = computed(() => {
  if (!props.question?.updated_at) return '—'
  return new Date(props.question.updated_at).toLocaleString()
})

const hasListeningSettings = computed(() => {
  const q = props.question
  return q && (q.listening_play_limit !== null || q.listening_lock_seek !== null || q.listening_auto_next !== undefined)
})

const hasSpeakingSettings = computed(() => {
  const q = props.question
  return q && (q.speaking_prepare_seconds || q.speaking_answer_seconds)
})

const close = () => emit('update:dialog', false)
</script>

<style scoped>
.question-detail-dialog {
  overflow: hidden;
}

.section-title {
  display: flex;
  align-items: center;
}

.content-block {
  background-color: #f8f9fa;
  border-left: 3px solid #1976d2;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.9rem;
  line-height: 1.5;
}

.info-item {
  margin-bottom: 8px;
}

.w-100 {
  width: 100%;
}

.border {
  border: 1px solid #e0e0e0;
  max-height: 400px;
}

.gap-2 {
  gap: 8px;
}

audio {
  outline: none;
  width: 100%;
  border-radius: 8px;
}
</style>
