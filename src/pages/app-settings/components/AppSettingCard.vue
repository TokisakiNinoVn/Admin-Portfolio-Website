<template>
  <div class="app-card" :class="{ 'app-card-inactive': !item.is_active }">
    <!-- Header: Icon & Status Switch -->
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="app-avatar-box">
        <i class="fa-solid fa-cube text-primary"></i>
      </div>

      <div class="d-flex align-center">
        <v-chip
          :color="item.is_active ? 'success' : 'secondary'"
          size="x-small"
          variant="flat"
          class="font-weight-bold mr-2"
        >
          {{ item.is_active ? 'Đang bật' : 'Đang tắt' }}
        </v-chip>
        <v-switch
          :model-value="Boolean(item.is_active)"
          color="success"
          hide-details
          inset
          density="compact"
          :loading="isToggling"
          @update:model-value="$emit('toggle', item)"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="app-card-body flex-grow-1" @click="$emit('view', item)">
      <h3 class="app-title text-truncate" :title="item.name_app">
        {{ item.name_app || 'Chưa đặt tên' }}
      </h3>
      <div class="app-link-text text-truncate mt-1" :title="item.link_app">
        <i class="bx bx-link mr-1"></i>
        <span v-if="item.link_app">{{ item.link_app }}</span>
        <span v-else class="text-caption text-medium-emphasis">Chưa gắn liên kết</span>
      </div>
      <div class="app-meta text-caption text-medium-emphasis mt-2">
        <i class="bx bx-time-five mr-1"></i>
        <span>{{ formatDate(item.updated_at || item.created_at) }}</span>
      </div>
    </div>

    <v-divider class="my-3" />

    <!-- Action Buttons -->
    <div class="app-card-actions d-flex align-center justify-space-between">
      <div>
        <v-btn
          v-if="item.link_app"
          icon="bx-link-external"
          variant="text"
          size="small"
          color="info"
          title="Mở liên kết"
          :href="item.link_app"
          target="_blank"
          rel="noopener noreferrer"
        />
        <v-btn
          icon="bx-show"
          variant="text"
          size="small"
          color="secondary"
          title="Xem chi tiết"
          @click="$emit('view', item)"
        />
      </div>
      <div class="d-flex align-center gap-1">
        <v-btn
          icon="bx-edit"
          variant="text"
          size="small"
          color="warning"
          title="Chỉnh sửa"
          @click="$emit('edit', item)"
        />
        <v-btn
          icon="bx-trash"
          variant="text"
          size="small"
          color="error"
          title="Xóa ứng dụng"
          @click="$emit('delete', item)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  app: { type: Object, default: null },
  friends: { type: Object, default: null }, // backward compatibility
  isToggling: { type: Boolean, default: false },
})

defineEmits(['view', 'edit', 'delete', 'toggle'])

const item = computed(() => props.app || props.friends || {})

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
</script>

<style scoped>
.app-card {
  border-radius: 12px;
  background-color: rgb(var(--v-theme-surface));
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 18px;
  transition: all 0.25s ease-in-out;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.app-card-inactive {
  opacity: 0.85;
  background-color: rgba(var(--v-theme-on-surface), 0.02);
}

.app-avatar-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.app-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  cursor: pointer;
}

.app-title:hover {
  color: rgb(var(--v-theme-primary));
}

.app-link-text {
  font-size: 0.85rem;
  color: rgb(var(--v-theme-primary));
  display: flex;
  align-items: center;
}

.gap-1 {
  gap: 4px;
}
</style>
