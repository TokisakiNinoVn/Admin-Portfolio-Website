<template>
  <v-dialog v-model="localDialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h4 title-detail">{{ document?.name }}</v-card-title>
      <v-card-text>
        <p><strong>Mô tả:</strong> {{ document?.description || '—' }}</p>

        <!-- Khu vực tên file -->
        <div v-if="document?.file_url" class="file-box mt-3">
          <strong>Tên file: </strong>
          <span class="file-name">{{ fileName }}</span>
        </div>

        <p class="mt-4">
          <strong>Đăng bởi:</strong>
          {{ document?.upload_by === 'teacher' ? 'Giáo viên' : 'Hệ thống' }}
        </p>
        <p><strong>Ngày tạo:</strong> {{ formattedCreatedAt }}</p>
        <p><strong>Ngày cập nhật:</strong> {{ formattedUpdatedAt }}</p>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <!-- Nút tải mới -->
        <v-btn
          v-if="document?.file_url"
          class="download-btn"
          :href="document.file_url"
          target="_blank"
          download
        >
          <i class="fa-solid fa-download mr-2"></i>
          <span>Tải Tài Liệu</span>
          
        </v-btn>

        <v-btn color="primary" variant="text" @click="close">Đóng</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  dialog: { type: Boolean, default: false },
  document: { type: Object, default: null }
})
const emit = defineEmits(['update:dialog'])

const localDialog = ref(props.dialog)
watch(() => props.dialog, (v) => (localDialog.value = v))
watch(localDialog, (v) => emit('update:dialog', v))

const formattedCreatedAt = computed(() => {
  if (!props.document?.created_at) return '—'
  return new Date(props.document.created_at).toLocaleDateString()
})
const formattedUpdatedAt = computed(() => {
  if (!props.document?.updated_at) return '—'
  return new Date(props.document.updated_at).toLocaleDateString()
})

const fileName = computed(() => {
  if (!props.document?.file_url) return '—'
  try {
    return decodeURIComponent(props.document.file_url.split('/').pop())
  } catch {
    return props.document.file_url
  }
})

const close = () => emit('update:dialog', false)
</script>

<style scoped>
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }

/* Khung hiển thị tên file */
.file-box {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
  border-radius: 8px;
}
.file-name {
  color: #2563eb;
  font-weight: 500;
  word-break: break-all;
}

/* Nút tải tài liệu */
.download-btn {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: white;
  font-weight: 600;
  text-transform: none;
  border-radius: 8px;
  padding: 8px 16px;
}
.download-btn i, .download-btn span {
  color: white
}
.download-btn:hover {
  background: linear-gradient(135deg, #22c55e, #15803d);
}

.title-detail {
  background-color: #2196f3;
  color: white;
  font-weight: 600;
  box-shadow: rgba(17, 17, 26, 0.1) 0px 4px 16px, rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 56px;
}
</style>
