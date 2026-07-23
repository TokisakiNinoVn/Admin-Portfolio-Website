<template>
  <v-dialog
    :model-value="dialog"
    @update:model-value="$emit('update:dialog', $event)"
    max-width="600px"
    persistent
  >
    <v-card>
      <v-card-title class="text-h5 font-weight-bold">
        Thêm cuộc hội thoại mới
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" @submit.prevent="submit" lazy-validation>
          <!-- Loại bài -->
          <v-select
            v-model="form.type"
            :items="types"
            label="Loại bài"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="compact"
            :disabled="isSubmitting"
            class="mb-4"
          />

          <!-- Nội dung -->
          <v-textarea
            v-model="form.content"
            label="Nội dung"
            variant="outlined"
            rows="4"
            :disabled="isSubmitting"
            class="mb-4"
          />

          <!-- Audio Sample -->
          <div class="audio-upload">
            <label for="audioFile">Audio mẫu (mp3):</label>
            <input
              type="file"
              id="audioFile"
              accept="audio/mpeg"
              @change="handleAudioUpload"
              :disabled="isSubmitting"
            />
            <audio
              v-if="audioPreviewUrl"
              :src="audioPreviewUrl"
              controls
            ></audio>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="close" :disabled="isSubmitting">
          Hủy
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="isSubmitting"
          @click="submit"
          class="btn-save"
        >
          <i class="fa-solid fa-check mr-2"></i>
          Lưu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { createSpeakingApi } from '@/apis/modules/speaking.api';
import { useToast } from '@/stores/toast.store';
import { onUnmounted, ref, watch, } from 'vue';

const props = defineProps({
  dialog: Boolean,
});
const emit = defineEmits(['update:dialog', 'created']);

const toast = useToast();

const types = [
  { title: 'Thực hành giao tiếp', value: 'conversation'},
  { title: 'Từng từ', value: 'word' },
  { title: 'Hội thoại', value: 'sentences' },
  { title: 'Ngữ pháp', value: 'grammar' },
]

const form = ref({
  content: '',
  audio_sample_url: null,
  type: 'conversation',
});

const audioPreviewUrl = ref(null);
const isSubmitting = ref(false);
const formRef = ref(null);

function handleAudioUpload(event) {
  const file = event.target.files?.[0];
  if (file) {
    form.value.audio_sample_url = file;
    if (audioPreviewUrl.value) {
      URL.revokeObjectURL(audioPreviewUrl.value);
    }
    audioPreviewUrl.value = URL.createObjectURL(file);
  }
}

function resetForm() {
  form.value = { content: '', audio_sample_url: null, type: 'conversation' };
  if (audioPreviewUrl.value) {
    URL.revokeObjectURL(audioPreviewUrl.value);
  }
  audioPreviewUrl.value = null;
}

function close() {
  emit('update:dialog', false);
  resetForm();
}

async function submit() {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    await nextTick();

    const formData = new FormData();
    formData.append('content', form.value.content);
    formData.append('type', form.value.type);

    if (form.value.audio_sample_url) {
      formData.append('audio_sample_url', form.value.audio_sample_url);
    }

    const response = await createSpeakingApi(formData);
    toast.show('Tạo bài nói thành công', 'success');
    emit('created', response.data);
    close();
  } catch (error) {
    console.error('Chi tiết lỗi:', error);
  } finally {
    isSubmitting.value = false;
  }
}

// Khi component unmount, thu hồi URL object
onUnmounted(() => {
  if (audioPreviewUrl.value) {
    URL.revokeObjectURL(audioPreviewUrl.value);
  }
});

// Khi dialog đóng, reset form tự động (nếu cần)
watch(() => props.dialog, (val) => {
  if (!val) resetForm();
});
</script>

<style scoped>
.v-card-title {
  background: linear-gradient(90deg, #1976d2, #42a5f5);
  color: white;
  padding: 16px;
}
.v-card-text {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.audio-upload {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}
.v-btn.btn-save {
  text-transform: none;
  font-weight: 500;
}
</style>
