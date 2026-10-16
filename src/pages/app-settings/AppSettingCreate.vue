<template>
  <v-dialog
    :model-value="dialog"
    max-width="560px"
    persistent
    @update:model-value="emit('update:dialog', $event)"
  >
    <v-card class="app-dialog-card">
      <v-card-title class="dialog-header d-flex align-center justify-space-between py-4 px-6">
        <div class="d-flex align-center">
          <div class="header-icon-box mr-3">
            <i class="fa-solid fa-shapes text-primary"></i>
          </div>
          <div>
            <h3 class="text-h6 font-weight-bold mb-0">Thêm ứng dụng mới</h3>
            <span class="text-caption text-medium-emphasis">Cấu hình thông tin ứng dụng trong hệ thống</span>
          </div>
        </div>
        <v-btn
          icon="bx-x"
          variant="text"
          density="comfortable"
          @click="close"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-form ref="formRef" @submit.prevent="submit">
          <!-- Tên ứng dụng -->
          <v-label class="text-subtitle-2 font-weight-medium mb-1">
            Tên ứng dụng <span class="text-error">*</span>
          </v-label>
          <v-text-field
            v-model="form.name_app"
            placeholder="Ví dụ: Portfolio Website, Chat App, LMS..."
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="bx-cube"
            class="mb-4"
            :rules="[v => !!(v && v.trim()) || 'Tên ứng dụng là bắt buộc']"
            autofocus
          />

          <!-- Link ứng dụng -->
          <v-label class="text-subtitle-2 font-weight-medium mb-1">
            Đường dẫn ứng dụng (URL)
          </v-label>
          <v-text-field
            v-model="form.link_app"
            placeholder="Ví dụ: https://my-app.example.com"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="bx-link"
            class="mb-4"
          />

          <!-- Trạng thái kích hoạt -->
          <v-card variant="tonal" color="primary" class="pa-4 rounded-lg">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="font-weight-bold text-subtitle-2 text-high-emphasis">
                  Trạng thái hoạt động
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ form.is_active ? 'Ứng dụng đang được bật và sẵn sàng truy cập' : 'Ứng dụng đang bị tạm tắt' }}
                </div>
              </div>
              <v-switch
                v-model="form.is_active"
                color="success"
                hide-details
                inset
              />
            </div>
          </v-card>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4">
        <v-spacer />
        <v-btn
          color="secondary"
          variant="tonal"
          :disabled="isSubmitting"
          @click="close"
        >
          Hủy
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="isSubmitting"
          prepend-icon="bx-check"
          @click="submit"
        >
          Lưu ứng dụng
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import AppSettingService from '@/services/app-settings.service'
import { useToast } from '@/stores/toast.store'
import { ref, watch } from 'vue'

const props = defineProps({
  dialog: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:dialog', 'created'])

const form = ref({
  name_app: '',
  link_app: '',
  is_active: true,
})

const toast = useToast()
const formRef = ref()
const isSubmitting = ref(false)

const close = () => {
  emit('update:dialog', false)
}

const submit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    isSubmitting.value = true
    const payload = {
      name_app: form.value.name_app.trim(),
      link_app: form.value.link_app ? form.value.link_app.trim() : '',
      is_active: Boolean(form.value.is_active),
    }

    const response = await AppSettingService.create(payload)
    emit('created', response)
    close()
    toast.show('Thêm ứng dụng thành công!', 'success')
  } catch (error) {
    console.error('Error creating app setting:', error)
    toast.show('Có lỗi xảy ra khi thêm ứng dụng!', 'error')
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => props.dialog,
  (val) => {
    if (!val) {
      form.value = {
        name_app: '',
        link_app: '',
        is_active: true,
      }
      if (formRef.value) {
        formRef.value.resetValidation()
      }
    }
  },
)
</script>

<style scoped>
.app-dialog-card {
  border-radius: 12px;
  overflow: hidden;
}

.header-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
</style>
