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
            <i class="fa-solid fa-pen-to-square text-warning"></i>
          </div>
          <div>
            <h3 class="text-h6 font-weight-bold mb-0">Cập nhật ứng dụng</h3>
            <span class="text-caption text-medium-emphasis">Chỉnh sửa thông tin và trạng thái ứng dụng</span>
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
          <v-card variant="tonal" :color="form.is_active ? 'success' : 'secondary'" class="pa-4 rounded-lg">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="font-weight-bold text-subtitle-2 text-high-emphasis d-flex align-center">
                  <span>Trạng thái hoạt động</span>
                  <v-chip
                    :color="form.is_active ? 'success' : 'default'"
                    size="x-small"
                    class="ml-2 font-weight-bold"
                  >
                    {{ form.is_active ? 'Đang bật' : 'Đang tắt' }}
                  </v-chip>
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ form.is_active ? 'Ứng dụng đang hoạt động và người dùng có thể truy cập' : 'Ứng dụng tạm ngừng hoạt động' }}
                </div>
              </div>
              <v-switch
                v-model="form.is_active"
                :color="form.is_active ? 'success' : 'default'"
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
          Lưu thay đổi
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
  appSetting: {
    type: Object,
    default: null,
  },
  // Backward compatibility prop if passed as friends
  friends: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:dialog', 'updated'])

const form = ref({
  id: null,
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

const syncFormData = (data) => {
  if (data) {
    form.value = {
      id: data.id ?? null,
      name_app: data.name_app ?? '',
      link_app: data.link_app ?? '',
      is_active: typeof data.is_active === 'boolean' ? data.is_active : true,
    }
  }
}

watch(
  () => props.appSetting || props.friends,
  (val) => {
    syncFormData(val)
  },
  { immediate: true },
)

watch(
  () => props.dialog,
  (open) => {
    if (open) {
      syncFormData(props.appSetting || props.friends)
    } else {
      if (formRef.value) {
        formRef.value.resetValidation()
      }
    }
  },
)

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

    const response = await AppSettingService.update(form.value.id, payload)
    emit('updated', response)
    close()
    toast.show('Cập nhật ứng dụng thành công!', 'success')
  } catch (error) {
    console.error('Error updating app setting:', error)
    toast.show('Có lỗi xảy ra khi cập nhật ứng dụng!', 'error')
  } finally {
    isSubmitting.value = false
  }
}
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
  background-color: rgba(var(--v-theme-warning), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
</style>
