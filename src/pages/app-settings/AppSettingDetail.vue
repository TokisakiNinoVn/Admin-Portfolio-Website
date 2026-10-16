<template>
  <v-dialog
    :model-value="dialog"
    max-width="560px"
    @update:model-value="emit('update:dialog', $event)"
  >
    <v-card class="app-detail-card" v-if="app">
      <v-card-title class="d-flex align-center justify-space-between py-4 px-6">
        <div class="d-flex align-center">
          <div class="app-icon-avatar mr-3">
            <i class="fa-solid fa-cube text-primary"></i>
          </div>
          <div>
            <h3 class="text-h6 font-weight-bold mb-0">{{ app.name_app || 'Ứng dụng không tên' }}</h3>
            <span class="text-caption text-medium-emphasis">ID: #{{ app.id }}</span>
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
        <v-list density="compact" class="py-0">
          <v-list-item class="px-0 mb-3">
            <template #prepend>
              <div class="info-icon mr-3">
                <i class="bx bx-tag-alt text-primary"></i>
              </div>
            </template>
            <v-list-item-title class="text-caption text-medium-emphasis">Tên ứng dụng</v-list-item-title>
            <v-list-item-subtitle class="text-body-1 font-weight-medium text-high-emphasis">
              {{ app.name_app || '—' }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item class="px-0 mb-3">
            <template #prepend>
              <div class="info-icon mr-3">
                <i class="bx bx-link-external text-info"></i>
              </div>
            </template>
            <v-list-item-title class="text-caption text-medium-emphasis">Đường dẫn ứng dụng</v-list-item-title>
            <v-list-item-subtitle class="text-body-1 font-weight-medium text-high-emphasis">
              <a
                v-if="app.link_app"
                :href="app.link_app"
                target="_blank"
                rel="noopener noreferrer"
                class="app-link"
              >
                {{ app.link_app }}
                <i class="fa-solid fa-arrow-up-right-from-square ml-1 text-caption"></i>
              </a>
              <span v-else class="text-medium-emphasis">—</span>
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item class="px-0 mb-3">
            <template #prepend>
              <div class="info-icon mr-3">
                <i class="bx bx-power-off" :class="app.is_active ? 'text-success' : 'text-secondary'"></i>
              </div>
            </template>
            <v-list-item-title class="text-caption text-medium-emphasis">Trạng thái hoạt động</v-list-item-title>
            <v-list-item-subtitle class="pt-1">
              <v-chip
                :color="app.is_active ? 'success' : 'secondary'"
                size="small"
                variant="flat"
                class="font-weight-bold"
              >
                <i :class="app.is_active ? 'fa-solid fa-check-circle mr-1' : 'fa-solid fa-circle-xmark mr-1'"></i>
                {{ app.is_active ? 'Đang hoạt động (Bật)' : 'Tạm dừng (Tắt)' }}
              </v-chip>
            </v-list-item-subtitle>
          </v-list-item>

          <v-row class="mt-2">
            <v-col cols="6">
              <div class="time-box pa-3 rounded-lg">
                <div class="text-caption text-medium-emphasis mb-1">
                  <i class="bx bx-calendar-plus mr-1"></i> Ngày tạo
                </div>
                <div class="text-caption font-weight-medium">
                  {{ formatDate(app.created_at) }}
                </div>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="time-box pa-3 rounded-lg">
                <div class="text-caption text-medium-emphasis mb-1">
                  <i class="bx bx-calendar-edit mr-1"></i> Cập nhật lần cuối
                </div>
                <div class="text-caption font-weight-medium">
                  {{ formatDate(app.updated_at) }}
                </div>
              </div>
            </v-col>
          </v-row>
        </v-list>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-6 py-4">
        <v-btn
          v-if="app.link_app"
          variant="outlined"
          color="primary"
          :href="app.link_app"
          target="_blank"
          rel="noopener noreferrer"
          prepend-icon="bx-link-external"
        >
          Mở ứng dụng
        </v-btn>
        <v-spacer />
        <v-btn color="secondary" variant="tonal" @click="close">
          Đóng
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  dialog: { type: Boolean, default: false },
  appSetting: { type: Object, default: null },
  friends: { type: Object, default: null }, // backward compatibility
})

const emit = defineEmits(['update:dialog'])

const app = computed(() => props.appSetting || props.friends)

const close = () => {
  emit('update:dialog', false)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.app-detail-card {
  border-radius: 12px;
  overflow: hidden;
}

.app-icon-avatar {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background-color: rgba(var(--v-theme-primary), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.info-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: rgba(var(--v-theme-on-surface), 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.time-box {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.app-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  word-break: break-all;
}

.app-link:hover {
  text-decoration: underline;
}
</style>
