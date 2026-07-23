<template>
  <div class="document-card">
    <!-- Nội dung -->
    <div class="card-content">
      <!-- Loại bài -->
      <v-select
        v-model="form.type"
        :items="types"
        label="Loại bài"
        item-title="title"
        item-value="value"
        variant="outlined"
        density="compact"
      ></v-select>

      <!-- Nội dung -->
      <v-textarea
        v-model="form.content"
        label="Nội dung"
        variant="outlined"
        rows="4"
      ></v-textarea>

      <!-- Audio Sample -->
      <div class="audio-upload">
        <label for="audioFile">Audio mẫu (mp3):</label>
        <input
          type="file"
          id="audioFile"
          accept="audio/mpeg"
          @change="handleAudioUpload"
        />
        <audio
          v-if="audioPreviewUrl"
          :src="audioPreviewUrl"
          controls
        ></audio>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="card-actions">
      <button @click="$emit('view', document)" title="Xem chi tiết">
        <i class="fa-solid fa-eye"></i>
      </button>
      <button @click="submit" title="Tạo mới">
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createSpeakingApi } from '@/apis/modules/speaking.api';
import { ref } from 'vue';

const props = defineProps({
  document: { type: Object, required: false }
});

const emit = defineEmits(['view', 'created']);

const types = [
  { title: 'Cuộc hội thoại', value: 'conversation' },
  { title: 'Từ vựng', value: 'vocabulary' },
  { title: 'Ngữ pháp', value: 'grammar' }
];

const form = ref({
  content: '',
  audio_sample_url: null as File | null,
  type: 'conversation'
});

const audioPreviewUrl = ref<string | null>(null);

const handleAudioUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    form.value.audio_sample_url = file;
    audioPreviewUrl.value = URL.createObjectURL(file);
  }
};

const submit = async () => {
  try {
    const formData = new FormData();
    formData.append('content', form.value.content || '');
    formData.append('type', form.value.type || '');
    if (form.value.audio_sample_url) {
      formData.append('audio_sample_url', form.value.audio_sample_url);
    }

    const response = await createSpeakingApi(formData);
    emit('created', response.data);

    // Reset form
    form.value = { content: '', audio_sample_url: null, type: 'conversation' };
    audioPreviewUrl.value = null;
  } catch (error) {
    console.error('Error creating document:', error);
  }
};
</script>

<style scoped>
.document-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.audio-upload {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

.card-actions {
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  border-top: 1px solid #eee;
}

.card-actions button {
  background: none;
  border: none;
  cursor: pointer;
  color: #555;
  font-size: 16px;
  transition: color 0.2s;
}

.card-actions button:hover {
  color: #1d4ed8;
}
</style>
