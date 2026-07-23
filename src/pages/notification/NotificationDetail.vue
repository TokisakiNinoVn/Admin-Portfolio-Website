<template>
  <v-dialog v-model="localDialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h5">{{ lesson?.title }}</v-card-title>
      <v-card-text>
        <!-- <v-img
          :src="formatURLImage(lesson?.cover)"
          :alt="lesson?.title"
          height="200"
          class="mb-4"
        /> -->
        <p><strong>Mô tả:</strong> {{ lesson?.description || '—' }}</p>
        <!-- <p><strong>Thời gian:</strong> {{ lesson?.limit_time ?? '—' }} phút</p>
        <p><strong>Độ khó:</strong> {{ lesson?.level ?? '—' }}</p>
        <p><strong>Loại:</strong> {{ typeTitle }}</p> -->
        <p><strong>Đăng bởi:</strong> {{ lesson?.upload_by === 'teacher' ? 'Giáo viên' : 'Hệ thống' }}</p>
        <p><strong>Ngày tạo:</strong> {{ formattedCreatedAt }}</p>
        <p><strong>Ngày cập nhật:</strong> {{ formattedUpdatedAt }}</p>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="close">Đóng</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  dialog: { type: Boolean, default: false },
  lesson: { type: Object, default: null },
  types: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:dialog'])

const localDialog = ref(props.dialog)
watch(() => props.dialog, (v) => (localDialog.value = v))
watch(localDialog, (v) => emit('update:dialog', v))

const typeTitle = computed(() => {
  if (!props.lesson) return '—'
  const found = props.types?.find(t => t.value === props.lesson.type)
  return found?.title ?? props.lesson.type ?? '—'
})

const formattedCreatedAt = computed(() => {
  if (!props.lesson?.created_at) return '—'
  return new Date(props.lesson.created_at).toLocaleDateString()
})
const formattedUpdatedAt = computed(() => {
  if (!props.lesson?.updated_at) return '—'
  return new Date(props.lesson.updated_at).toLocaleDateString()
})

const close = () => emit('update:dialog', false)
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }
</style>
