<template>
  <v-dialog v-model="localDialog" max-width="650px">
    <v-card class="pa-4">
      <!-- Tiêu đề -->
      <v-card-title class="text-h5 font-weight-bold pb-2">
        <i class="fa-solid fa-microphone-lines mr-2 text-primary"></i>
        Chi tiết Speaking
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <!-- Loại bài -->
        <p class="mb-2">
          <strong>Loại:</strong>
          <v-chip color="indigo" text-color="white" size="small" class="ml-1">
            {{ mappedType || '—' }}
          </v-chip>
        </p>

        <!-- Nội dung -->
        <p class="mb-4">
          <i class="fa-solid fa-align-left mr-2 text-secondary"></i>
          <strong>Nội dung:</strong>
          <span class="ml-1">{{ speaking?.content || '—' }}</span>
        </p>

        <!-- Audio sample -->
        <div v-if="speaking?.audio_sample_url" class="audio-box mb-4">
          <i class="fa-solid fa-headphones mr-2 text-success"></i>
          <strong>Audio Sample:</strong>
          <audio
            class="mt-2 w-100"
            controls
            :src="formatURLFile(speaking.audio_sample_url)"
          ></audio>
        </div>

        <!-- Người upload -->
        <p class="mb-2">
          <i class="fa-solid fa-user mr-2 text-info"></i>
          <strong>Đăng bởi:</strong>
          {{ speaking?.upload_by === 'teacher' ? 'Giáo viên' : 'Hệ thống' }}
        </p>

        <!-- Ngày tạo/cập nhật -->
        <p class="mb-2">
          <i class="fa-regular fa-calendar-plus mr-2 text-warning"></i>
          <strong>Ngày tạo:</strong> {{ formattedCreatedAt }}
        </p>
        <p class="mb-4">
          <i class="fa-regular fa-calendar-check mr-2 text-warning"></i>
          <strong>Ngày cập nhật:</strong> {{ formattedUpdatedAt }}
        </p>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Action buttons -->
      <v-card-actions class="justify-space-between mt-2">
        <v-btn
          v-if="speaking?.audio_sample_url"
          class="download-btn"
          :href="formatURLFile(speaking.audio_sample_url)"
          target="_blank"
          download
        >
          <i class="fa-solid fa-download mr-2"></i>
          Tải Audio
        </v-btn>

        <v-spacer></v-spacer>
        <v-btn variant="outlined" color="grey" @click="close">
          <i class="fa-solid fa-xmark mr-1"></i> Đóng
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { formatURLFile } from '@/utils/format.util.js';
import { computed, ref, watch } from 'vue';

const types = [
  { title: 'Cuộc hội thoại', value: 'conversation' },
  { title: 'Từ vựng', value: 'vocabulary' },
  { title: 'Ngữ pháp', value: 'grammar' }
];

const props = defineProps({
  dialog: { type: Boolean, default: false },
  speaking: { type: Object, default: null }
});
const emit = defineEmits(['update:dialog']);

const localDialog = ref(props.dialog);
watch(() => props.dialog, (v) => (localDialog.value = v));
watch(localDialog, (v) => emit('update:dialog', v));

const mappedType = computed(() => {
  if (!props.speaking?.type) return null;
  const found = types.find(t => t.value === props.speaking.type);
  return found ? found.title : props.speaking.type;
});

const formattedCreatedAt = computed(() => {
  if (!props.speaking?.created_at) return '—';
  return new Date(props.speaking.created_at).toLocaleString();
});
const formattedUpdatedAt = computed(() => {
  if (!props.speaking?.updated_at) return '—';
  return new Date(props.speaking.updated_at).toLocaleString();
});

const close = () => emit('update:dialog', false);
</script>

<style scoped>
.audio-box {
  background: #f1f5f9;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.download-btn {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: white !important;
  font-weight: 600;
  text-transform: none;
  border-radius: 8px;
  padding: 8px 16px;
}
.download-btn:hover {
  background: linear-gradient(135deg, #22c55e, #15803d);
}
.text-primary { color: #2563eb; }
.text-secondary { color: #6b7280; }
.text-success { color: #16a34a; }
.text-warning { color: #d97706; }
.text-info { color: #0ea5e9; }
</style>
