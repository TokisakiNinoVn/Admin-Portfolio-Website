<template>
  <v-dialog v-model="localDialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h5 bg-primary text-white">
        Tiêu chí: {{ rubric?.name || '--' }}
      </v-card-title>
      <v-card-text>
        <!-- <v-img
          :src="formatURLImage(rubric?.cover)"
          :alt="rubric?.title"
          height="200"
          class="mb-4"
        /> -->
        <p><strong>Mô tả:</strong> {{ rubric?.description || '—' }}</p>
        <!-- <p><strong>Thời gian:</strong> {{ rubric?.limit_time ?? '—' }} phút</p>
        <p><strong>Độ khó:</strong> {{ rubric?.level ?? '—' }}</p>
        <p><strong>Loại:</strong> {{ typeTitle }}</p> -->
        <p><strong>Đăng bởi:</strong> {{ rubric?.upload_by === 'teacher' ? 'Giáo viên' : 'Hệ thống' }}</p>
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
  rubric: { type: Object, default: null },
  types: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:dialog'])

const localDialog = ref(props.dialog)
watch(() => props.dialog, (v) => (localDialog.value = v))
watch(localDialog, (v) => emit('update:dialog', v))

const typeTitle = computed(() => {
  if (!props.rubric) return '—'
  const found = props.types?.find(t => t.value === props.rubric.type)
  return found?.title ?? props.rubric.type ?? '—'
})

const formattedCreatedAt = computed(() => {
  if (!props.rubric?.created_at) return '—'
  return new Date(props.rubric.created_at).toLocaleDateString()
})
const formattedUpdatedAt = computed(() => {
  if (!props.rubric?.updated_at) return '—'
  return new Date(props.rubric.updated_at).toLocaleDateString()
})

const close = () => emit('update:dialog', false)
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }
</style>
