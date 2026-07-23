<template>
  <div class="document-card">
    <!-- Cover -->
    <div class="cover-container">
      <img
        class="cover-image"
        src="https://i.pinimg.com/1200x/79/09/83/79098373f2e5d416938aeac44188d9d5.jpg"
        alt="Speaking test"
      />
    </div>

    <!-- Nội dung -->
    <div class="card-content" @click="$emit('view', document)">
      <h3 class="document-title">{{ document.content }}</h3>

      <!-- Info -->
      <div class="document-info">
        <span class="info-tag">
          <i class="fa-solid fa-microphone"></i>
          {{ audioDuration || '...' }}
        </span>
        <span class="info-tag purple">
          {{ formatType(document.type || 'speaking') }}
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="card-actions">
      <button @click="$emit('view', document)" title="Xem chi tiết">
        <i class="fa-solid fa-eye"></i>
      </button>
      <button @click="$emit('view', document)" title="Thêm vào bài nói">
        <i class="fa-solid fa-plus"></i>
      </button>
      <button @click="$emit('edit', document)" title="Sửa">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button @click="$emit('delete', document)" title="Xoá">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>

    <!-- Hidden audio just to get duration -->
    <audio
      v-if="document.audio_sample_url"
      ref="audioPlayer"
      :src="formatURLFile(document.audio_sample_url)"
      @loadedmetadata="setAudioDuration"
      style="display: none;"
    ></audio>
  </div>
</template>

<script setup>
import { formatURLFile } from '@/utils/format.util.js'
import { onMounted, ref } from 'vue'

const types = [
  { title: 'Cuộc hội thoại', value: 'conversation' },
  { title: 'Từ vựng', value: 'vocabulary' },
  { title: 'Ngữ pháp', value: 'grammar' },
  { title: 'Nói', value: 'speaking' },
]

const props = defineProps({
  document: { type: Object, required: true },
})
const emit = defineEmits(['view', 'edit', 'delete'])

const audioPlayer = ref(null)
const audioDuration = ref('')

const setAudioDuration = () => {
  if (audioPlayer.value && audioPlayer.value.duration) {
    const seconds = Math.floor(audioPlayer.value.duration)
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    audioDuration.value = `${min} phút ${sec} giây`
  }
}

const formatType = (type) => {
  const found = types.find(t => t.value === type)
  return found ? found.title : type
}

// Mặc định chuyển type thành speaking
onMounted(() => {
  if (!props.document.type) {
    props.document.type = 'speaking'
  }
})
</script>

<style scoped>
.document-card {
  border-radius: 12px;
  /* background-color: #fff; */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  /* box-shadow: 0 4px 12px rgba(0,0,0,0.1); */
}

.cover-container {
  height: 140px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 12px 16px;
}

.document-title {
  font-size: 16px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 10px;
  min-height: 47px;
}

.document-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.info-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  padding: 3px 8px;
  border-radius: 999px;
  background-color: #dbeafe;
  color: #1e40af;
}

.info-tag.purple {
  background-color: #ede9fe;
  color: #6b21a8;
}

.card-actions {
  display: flex;
  justify-content: space-around;
  padding: 10px 0 0px 0;
  border-top: 1px solid #eee;
}

.card-actions button {
  background: none;
  border: none;
  cursor: pointer;
  color: #555;
  font-size: 16px;
}

.card-actions button:hover {
  color: #1d4ed8;
}
</style>
