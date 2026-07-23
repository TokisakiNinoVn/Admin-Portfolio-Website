<template>
  <div class="question-card">
    <div class="card-content" @click="$emit('view', question)">
      <!-- Header với icon và tiêu đề -->
      <div class="question-header">
        <div class="question-icon" :class="skillIconClass">
          <i :class="skillIcon"></i>
        </div>

        <div class="question-info">
          <h2 class="question-title" :title="question.title">
            {{ question.title || 'Câu hỏi không tiêu đề' }}
          </h2>
          <div class="topic-badge">
            <i class="fa-solid fa-tag"></i>
            <span>{{ topicName }}</span>
          </div>
        </div>
      </div>

      <!-- Badges: kỹ năng, loại câu hỏi, độ khó -->
      <div class="badges-group">
        <span class="badge skill-badge" :class="skillBadgeClass">
          <i :class="skillIcon"></i> {{ skillLabel }}
        </span>
        <span class="badge type-badge">
          <i class="fa-solid fa-list-check"></i> {{ questionTypeLabel }}
        </span>
        <span class="badge difficulty-badge" :class="difficultyBadgeClass">
          <i class="fa-solid fa-chart-simple"></i> {{ difficultyLabel }}
        </span>
        <span class="badge score-badge">
          <i class="fa-solid fa-star"></i> {{ formattedScore }} điểm
        </span>
      </div>

      <!-- Media preview: audio + image -->
      <!-- <div class="media-section">
        <div v-if="hasAudio" class="audio-player">
          <div class="audio-info">
            <i class="fa-solid fa-headphones"></i>
            <span>Audio câu hỏi</span>
            <span class="audio-limit" v-if="question.listening_play_limit">
              (Nghe tối đa: {{ question.listening_play_limit }} lần)
            </span>
            <span class="audio-lock" v-if="question.listening_lock_seek">
              <i class="fa-solid fa-lock"></i> Không tua
            </span>
          </div>
          <button
            class="play-btn"
            :class="{ playing: isPlaying }"
            @click.stop="toggleAudio"
            :disabled="isAudioDisabled"
            :title="audioButtonTitle"
          >
            <i :class="isPlaying ? 'fa-solid fa-stop' : 'fa-solid fa-play'"></i>
          </button>
          <span v-if="playCount > 0" class="play-count">
            Đã nghe: {{ playCount }}/{{ question.listening_play_limit || '∞' }}
          </span>
        </div>
        <div v-else class="no-audio">
          <i class="fa-solid fa-circle-xmark"></i> Không có audio
        </div>

        <div v-if="hasImage" class="image-preview">
          <img
            :src="question.image_url"
            alt="Question image"
            @click.stop="openImagePreview"
            class="thumbnail"
          />
          <button class="expand-img" @click.stop="openImagePreview">
            <i class="fa-regular fa-image"></i>
          </button>
        </div>
        <div v-else class="no-image">
          <i class="fa-regular fa-image"></i> Không có ảnh
        </div>
      </div> -->

      <!-- Thông tin bổ sung (giới hạn, auto-next, ngày tạo) -->
      <div class="extra-meta">
        <div v-if="question.listening_auto_next" class="meta-item">
          <i class="fa-solid fa-forward-step"></i> Tự động chuyển câu
        </div>
        <div class="meta-item">
          <i class="fa-regular fa-calendar"></i>
          {{ formatDateTime(question.created_at) }}
        </div>
      </div>
    </div>

    <!-- Actions buttons -->
    <div class="card-actions">
      <button class="action-btn view" @click="$emit('view', question)" title="Xem chi tiết">
        <i class="fa-solid fa-eye"></i>
      </button>
      <button class="action-btn edit" @click="$emit('edit', question)" title="Chỉnh sửa">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button class="action-btn delete" @click="$emit('delete', question)" title="Xóa">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>

    <!-- Modal preview ảnh -->
    <div v-if="imagePreviewVisible" class="image-modal" @click="closeImagePreview">
      <div class="modal-content" @click.stop>
        <img :src="question.image_url" alt="Full size image" />
        <button class="close-modal" @click="closeImagePreview">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
})


// {
//     "id": 5,
//     "exam_topic_id": 1,
//     "teacher_id": 1,
//     "skill_type": "listening",
//     "question_type": "mcq",
//     "difficulty_level": "easy",
//     "title": "C\u00e2u h\u1ecfi tr\u1eafc nghi\u1ec7m",
//     "instruction": null,
//     "passage_content": null,
//     "audio_url": "https:\/\/quanly.thainguyenedu.vn\/storage\/exam\/audio\/lRRMKiX6WCNb0LvyqSUsUnMwTNqyGHNxNGIH7JQr.mp3",
//     "image_url": "https:\/\/quanly.thainguyenedu.vn\/storage\/exam\/images\/WNH3Jje5Op3Z5mrRm8HiWJos9pE2Lm9xtPTInsPm.jpg",
//     "answer_explanation": null,
//     "score": "100.00",
//     "listening_play_limit": 1,
//     "listening_lock_seek": 1,
//     "listening_auto_next": false,
//     "speaking_prepare_seconds": null,
//     "speaking_answer_seconds": null,
//     "status": 1,
//     "created_at": "2026-06-04T03:07:07.000000Z",
//     "updated_at": "2026-06-04T03:07:07.000000Z",
//     "topic": {
//         "id": 1,
//         "name": "Bi\u1ec3n v\u00e0 \u0111\u1ea1i d\u01b0\u01a1ng",
//         "description": "C\u00e1c c\u00e2u h\u1ecfi li\u00ean quan \u0111\u1ebfn bi\u1ec3n v\u00e0 \u0111\u1ea1i d\u01b0\u01a1ng",
//         "created_at": "2026-05-28T02:17:24.000000Z",
//         "updated_at": "2026-05-28T02:17:24.000000Z"
//     }
// },

const emit = defineEmits(['view', 'edit', 'delete'])

// --- Mapping các enum ---
const skillMap = {
  listening: { label: 'Nghe', icon: 'fa-solid fa-headphones', class: 'listening' },
  reading: { label: 'Đọc', icon: 'fa-solid fa-book-open', class: 'reading' },
  speaking: { label: 'Nói', icon: 'fa-solid fa-microphone', class: 'speaking' },
  writing: { label: 'Viết', icon: 'fa-solid fa-pen-fancy', class: 'writing' },
}
const questionTypeMap = {
  mcq: 'Trắc nghiệm',
  essay: 'Tự luận',
  matching: 'Nối đáp án',
  fill_blank: 'Điền vào chỗ trống',
}
const difficultyMap = {
  easy: { label: 'Dễ', class: 'difficulty-easy' },
  medium: { label: 'Trung bình', class: 'difficulty-medium' },
  hard: { label: 'Khó', class: 'difficulty-hard' },
}

const skill = computed(() => skillMap[props.question.skill_type] || { label: 'Khác', icon: 'fa-solid fa-question', class: '' })
const skillLabel = computed(() => skill.value.label)
const skillIcon = computed(() => skill.value.icon)
const skillIconClass = computed(() => skill.value.class)
const skillBadgeClass = computed(() => skill.value.class)

const questionTypeLabel = computed(() => questionTypeMap[props.question.question_type] || props.question.question_type || 'Chưa xác định')
const difficulty = computed(() => difficultyMap[props.question.difficulty_level] || { label: 'Chưa xác định', class: '' })
const difficultyLabel = computed(() => difficulty.value.label)
const difficultyBadgeClass = computed(() => difficulty.value.class)

const formattedScore = computed(() => {
  const score = parseFloat(props.question.score)
  return isNaN(score) ? '0.00' : score.toFixed(2)
})

const topicName = computed(() => props.question.topic?.name || 'Không có chủ đề')

const hasAudio = computed(() => !!props.question.audio_url)
const hasImage = computed(() => !!props.question.image_url)

// --- Audio logic: giới hạn số lần nghe, lock seek ---
const playCount = ref(0)
const isPlaying = ref(false)
let audioInstance = null

const isAudioDisabled = computed(() => {
  const limit = props.question.listening_play_limit
  if (!limit) return false
  return playCount.value >= limit
})

const audioButtonTitle = computed(() => {
  if (isAudioDisabled.value) return 'Đã đạt giới hạn nghe'
  if (isPlaying.value) return 'Dừng audio'
  return 'Phát audio'
})

// Hàm dọn dẹp audio cũ
const stopAudio = () => {
  if (audioInstance) {
    audioInstance.pause()
    audioInstance = null
  }
  isPlaying.value = false
}

const playAudio = () => {
  if (!hasAudio.value) return
  const limit = props.question.listening_play_limit
  if (limit && playCount.value >= limit) {
    alert(`Chỉ được nghe tối đa ${limit} lần. Đã hết lượt nghe.`)
    return
  }

  stopAudio() // tắt audio đang phát

  audioInstance = new Audio(props.question.audio_url)
  
  // Nếu lock_seek được bật, không cho phép tua (bỏ qua controls, nhưng cũng disable sự kiện seeking)
  // Để đảm bảo không tua, ta sẽ không hiển thị thanh điều khiển, chỉ có nút play/stop.
  // Và khi phát, người dùng không thể tua được.
  if (props.question.listening_lock_seek) {
    // Không làm gì thêm: audio mặc định có thể tua nhưng vì không có controls nên user không thể tua.
    // Nếu muốn chắc chắn chặn bằng JS, có thể lắng nghe sự kiện seeking và reset time.
    audioInstance.addEventListener('seeking', (e) => {
      if (props.question.listening_lock_seek) {
        e.preventDefault()
        audioInstance.currentTime = 0 // hoặc giữ nguyên vị trí cũ, đơn giản quay về 0
      }
    })
  }

  audioInstance.play()
  playCount.value++
  isPlaying.value = true

  audioInstance.addEventListener('ended', () => {
    isPlaying.value = false
    audioInstance = null
  })
  audioInstance.addEventListener('error', () => {
    isPlaying.value = false
    audioInstance = null
    alert('Không thể phát audio, vui lòng kiểm tra đường dẫn.')
  })
}

const toggleAudio = () => {
  if (isAudioDisabled.value) return
  if (isPlaying.value) {
    stopAudio()
  } else {
    playAudio()
  }
}

// --- Image preview modal ---
const imagePreviewVisible = ref(false)
const openImagePreview = () => {
  if (hasImage.value) imagePreviewVisible.value = true
}
const closeImagePreview = () => {
  imagePreviewVisible.value = false
}

// --- Helper format datetime ---
const formatDateTime = (dateString) => {
  if (!dateString) return 'Không rõ'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Cleanup khi component unmount
onUnmounted(() => {
  if (audioInstance) {
    audioInstance.pause()
    audioInstance = null
  }
})
</script>

<style scoped>
/* Tổng thể card */
.question-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #eef2f7;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.25s ease;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
}
.question-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.12);
}
.card-content {
  padding: 20px;
  flex: 1;
  cursor: pointer;
}
/* Header */
.question-header {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 16px;
}
.question-icon {
  min-width: 52px;
  height: 52px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: white;
  background: #94a3b8;
}
.question-icon.skill-listening {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
}
.question-icon.skill-reading {
  background: linear-gradient(135deg, #059669, #10b981);
}
.question-icon.skill-speaking {
  background: linear-gradient(135deg, #d97706, #f59e0b);
}
.question-icon.skill-writing {
  background: linear-gradient(135deg, #dc2626, #ef4444);
}
.question-info {
  flex: 1;
  min-width: 0;
}
.question-title {
  margin: 0 0 6px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.topic-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 30px;
  color: #334155;
}
.topic-badge i {
  font-size: 0.7rem;
}
/* Badges group */
.badges-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 30px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #f8fafc;
  color: #1e293b;
}
.skill-badge {
  background: #eff6ff;
  color: #1d4ed8;
}
.type-badge {
  background: #f3e8ff;
  color: #7e22ce;
}
.difficulty-easy {
  background: #dcfce7;
  color: #15803d;
}
.difficulty-medium {
  background: #fef9c3;
  color: #a16207;
}
.difficulty-hard {
  background: #fee2e2;
  color: #b91c1c;
}
.score-badge {
  background: #fef3c7;
  color: #b45309;
}
/* Media section */
.media-section {
  background: #f9fafb;
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.audio-player {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  background: white;
  padding: 8px 12px;
  border-radius: 40px;
  border: 1px solid #e2e8f0;
}
.audio-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #334155;
  flex-wrap: wrap;
}
.audio-limit, .audio-lock {
  font-size: 0.7rem;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 20px;
}
.audio-lock i {
  margin-right: 4px;
}
.play-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: #2563eb;
  color: white;
  cursor: pointer;
  transition: 0.2s;
}
.play-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}
.play-btn.playing {
  background: #dc2626;
}
.play-count {
  font-size: 0.7rem;
  color: #475569;
}
.no-audio, .no-image {
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
}
.image-preview {
  position: relative;
  display: inline-block;
  width: fit-content;
}
.thumbnail {
  max-height: 100px;
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  transition: 0.2s;
}
.thumbnail:hover {
  transform: scale(1.02);
}
.expand-img {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0,0,0,0.6);
  border: none;
  border-radius: 30px;
  color: white;
  padding: 4px 8px;
  font-size: 0.7rem;
  cursor: pointer;
}
/* Extra meta */
.extra-meta {
  display: flex;
  gap: 12px;
  font-size: 0.7rem;
  color: #64748b;
  flex-wrap: wrap;
  border-top: 1px solid #ecf3fa;
  padding-top: 12px;
  margin-top: 6px;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
/* Actions */
.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #f1f5f9;
  background: #fafcff;
}
.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 14px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.action-btn:hover {
  transform: translateY(-2px);
}
.action-btn.view { color: #2563eb; }
.action-btn.view:hover { background: #eff6ff; }
.action-btn.edit { color: #d97706; }
.action-btn.edit:hover { background: #fffbeb; }
.action-btn.delete { color: #dc2626; }
.action-btn.delete:hover { background: #fef2f2; }
/* Image modal */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}
.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}
.modal-content img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 20px;
  box-shadow: 0 20px 35px rgba(0,0,0,0.4);
}
.close-modal {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(0,0,0,0.6);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  border-radius: 30px;
  width: 40px;
  height: 40px;
}
@media (max-width: 640px) {
  .badges-group {
    gap: 6px;
  }
  .question-title {
    font-size: 1rem;
  }
}
</style>
