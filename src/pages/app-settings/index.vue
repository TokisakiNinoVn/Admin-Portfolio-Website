<template>
  <div class="app-settings-page">
    <!-- Header Section -->
    <v-card class="mb-4 header-card" elevation="1">
      <v-card-text class="pa-5">
        <div class="d-flex flex-wrap align-center justify-space-between gap-4">
          <!-- Title & Subtitle -->
          <div class="d-flex align-center">
            <div class="header-icon mr-4">
              <i class="fa-solid fa-cubes-stacked text-primary"></i>
            </div>
            <div>
              <h2 class="text-h5 font-weight-bold mb-1">Cấu hình Ứng dụng</h2>
              <p class="text-caption text-medium-emphasis mb-0">
                Quản lý danh sách các ứng dụng, chuyển đổi trạng thái bật/tắt và liên kết hệ thống
              </p>
            </div>
          </div>

          <!-- Stats Badges -->
          <div class="d-flex align-center flex-wrap gap-2">
            <div class="stat-badge stat-all">
              <span class="stat-count">{{ appSettings.length }}</span>
              <span class="stat-label">Tổng ứng dụng</span>
            </div>
            <div class="stat-badge stat-active">
              <span class="stat-count">{{ activeAppsCount }}</span>
              <span class="stat-label">Đang bật</span>
            </div>
            <div class="stat-badge stat-inactive">
              <span class="stat-count">{{ inactiveAppsCount }}</span>
              <span class="stat-label">Đang tắt</span>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Toolbar: Search, Filters & Action Add -->
    <v-card class="mb-4 toolbar-card" elevation="1">
      <v-card-text class="pa-4">
        <v-row align="center" dense>
          <!-- Search field -->
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="searchQuery"
              placeholder="Tìm kiếm theo tên app, liên kết..."
              variant="outlined"
              density="compact"
              prepend-inner-icon="bx-search"
              clearable
              hide-details
            />
          </v-col>

          <!-- Status Filter -->
          <v-col cols="12" sm="4" md="3">
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              item-title="title"
              item-value="value"
              label="Trạng thái"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="bx-filter-alt"
            />
          </v-col>

          <!-- View Mode Toggle & Refresh -->
          <v-col cols="12" sm="2" md="2" class="d-flex align-center">
            <v-btn-toggle
              v-model="viewMode"
              mandatory
              density="compact"
              color="primary"
              variant="outlined"
              class="mr-2"
            >
              <v-btn value="list" size="small" title="Dạng danh sách">
                <i class="bx bx-list-ul"></i>
              </v-btn>
              <v-btn value="grid" size="small" title="Dạng thẻ lưới">
                <i class="bx bx-grid-alt"></i>
              </v-btn>
            </v-btn-toggle>

            <v-btn
              icon="bx-refresh"
              variant="text"
              density="comfortable"
              color="secondary"
              title="Tải lại dữ liệu"
              :loading="loading"
              @click="fetchAppSettings"
            />
          </v-col>

          <!-- Add Button -->
          <v-col cols="12" sm="12" md="3" class="d-flex justify-end">
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="bx-plus"
              class="btn-add font-weight-bold"
              @click="openCreateDialog"
            >
              Thêm ứng dụng
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Main Content: Loading State -->
    <v-card v-if="loading && appSettings.length === 0" elevation="1" class="pa-10 text-center">
      <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
      <div class="text-subtitle-1 text-medium-emphasis">Đang tải dữ liệu ứng dụng...</div>
    </v-card>

    <!-- Main Content: Empty State -->
    <v-card
      v-else-if="filteredApps.length === 0"
      elevation="1"
      class="pa-10 text-center empty-card"
    >
      <div class="empty-icon-wrap mb-3">
        <i class="fa-solid fa-shapes fa-3x text-medium-emphasis"></i>
      </div>
      <h3 class="text-h6 font-weight-bold mb-1">
        {{ searchQuery || statusFilter !== 'all' ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có ứng dụng nào' }}
      </h3>
      <p class="text-caption text-medium-emphasis mb-4">
        {{
          searchQuery || statusFilter !== 'all'
            ? 'Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bỏ chọn bộ lọc trạng thái.'
            : 'Nhấn nút "Thêm ứng dụng" bên trên để bắt đầu cấu hình ứng dụng mới.'
        }}
      </p>
      <div class="d-flex justify-center gap-2">
        <v-btn
          v-if="searchQuery || statusFilter !== 'all'"
          variant="outlined"
          color="secondary"
          @click="resetFilters"
        >
          Xóa bộ lọc
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="bx-plus"
          @click="openCreateDialog"
        >
          Thêm ứng dụng
        </v-btn>
      </div>
    </v-card>

    <!-- Main Content: LIST / TABLE VIEW (Primary View) -->
    <v-card v-else-if="viewMode === 'list'" elevation="1" class="table-card overflow-hidden">
      <div class="table-responsive">
        <v-table class="app-table" hover fixed-header>
          <thead>
            <tr>
              <th class="text-center" style="width: 70px;">STT</th>
              <th style="min-width: 220px;">Tên ứng dụng</th>
              <th style="min-width: 260px;">Đường dẫn (URL)</th>
              <th class="text-center" style="width: 170px;">Trạng thái</th>
              <th class="text-center" style="width: 160px;">Bật / Tắt</th>
              <th class="text-center" style="width: 140px;">Ngày tạo</th>
              <th class="text-center" style="width: 150px;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in filteredApps"
              :key="item.id"
              :class="{ 'row-inactive': !item.is_active }"
            >
              <!-- STT -->
              <td class="text-center font-weight-medium text-caption">
                {{ index + 1 }}
              </td>

              <!-- Tên ứng dụng -->
              <td>
                <div class="d-flex align-center py-2">
                  <div class="app-icon-badge mr-3" :class="item.is_active ? 'badge-active' : 'badge-inactive'">
                    <i class="fa-solid fa-cube"></i>
                  </div>
                  <div>
                    <div class="font-weight-bold text-subtitle-2 app-name">
                      {{ item.name_app || '—' }}
                    </div>
                    <span class="text-caption text-medium-emphasis">ID: #{{ item.id }}</span>
                  </div>
                </div>
              </td>

              <!-- Đường dẫn (URL) -->
              <td>
                <div v-if="item.link_app" class="d-flex align-center">
                  <a
                    :href="item.link_app"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link-preview text-truncate d-inline-block"
                    :title="item.link_app"
                  >
                    {{ item.link_app }}
                  </a>
                  <v-btn
                    icon="bx-copy"
                    variant="text"
                    size="x-small"
                    color="secondary"
                    class="ml-1"
                    title="Sao chép liên kết"
                    @click.stop="copyLink(item.link_app)"
                  />
                  <v-btn
                    icon="bx-link-external"
                    variant="text"
                    size="x-small"
                    color="primary"
                    title="Mở tab mới"
                    :href="item.link_app"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                </div>
                <span v-else class="text-caption text-medium-emphasis fst-italic">
                  Chưa cấu hình
                </span>
              </td>

              <!-- Trạng thái (Chip) -->
              <td class="text-center">
                <v-chip
                  :color="item.is_active ? 'success' : 'secondary'"
                  size="small"
                  variant="tonal"
                  class="font-weight-bold px-3"
                >
                  <span class="status-dot mr-1" :class="item.is_active ? 'dot-active' : 'dot-inactive'"></span>
                  {{ item.is_active ? 'Đang bật' : 'Đang tắt' }}
                </v-chip>
              </td>

              <!-- Nút Bật / Tắt app (Switch) -->
              <td class="text-center">
                <div class="d-flex align-center justify-center">
                  <v-switch
                    :model-value="Boolean(item.is_active)"
                    color="success"
                    hide-details
                    inset
                    density="compact"
                    :loading="togglingIds.has(item.id)"
                    :disabled="togglingIds.has(item.id)"
                    @update:model-value="toggleAppActive(item)"
                  />
                </div>
              </td>

              <!-- Ngày tạo -->
              <td class="text-center text-caption text-medium-emphasis">
                {{ formatDate(item.created_at) }}
              </td>

              <!-- Thao tác: Xem, Sửa, Xóa, Bật/Tắt -->
              <td class="text-center">
                <div class="d-flex align-center justify-center action-buttons gap-1">
                  <!-- Xem chi tiết -->
                  <v-btn
                    icon="bx-show"
                    variant="text"
                    size="small"
                    color="primary"
                    title="Xem chi tiết"
                    @click="openDetail(item)"
                  />

                  <!-- Sửa -->
                  <v-btn
                    icon="bx-edit"
                    variant="text"
                    size="small"
                    color="warning"
                    title="Chỉnh sửa ứng dụng"
                    @click="editApp(item)"
                  />

                  <!-- Xóa -->
                  <v-btn
                    icon="bx-trash"
                    variant="text"
                    size="small"
                    color="error"
                    title="Xóa ứng dụng"
                    @click="openDeleteConfirm(item)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </v-card>

    <!-- Main Content: GRID VIEW (Alternate View) -->
    <v-row v-else class="mt-1">
      <v-col
        v-for="item in filteredApps"
        :key="item.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <AppSettingCard
          :app="item"
          :is-toggling="togglingIds.has(item.id)"
          @view="openDetail"
          @edit="editApp"
          @delete="openDeleteConfirm"
          @toggle="toggleAppActive"
        />
      </v-col>
    </v-row>

    <!-- Dialogs -->
    <!-- Dialog Thêm mới -->
    <AppSettingCreateDialog
      v-model:dialog="dialogCreate"
      @created="onAppCreated"
    />

    <!-- Dialog Chỉnh sửa -->
    <AppSettingEditDialog
      v-model:dialog="dialogEdit"
      :app-setting="selectedApp"
      @updated="onAppUpdated"
    />

    <!-- Dialog Xem chi tiết -->
    <AppSettingDetail
      v-model:dialog="dialogDetail"
      :app-setting="selectedApp"
    />

    <!-- Dialog Xác nhận xóa -->
    <v-dialog v-model="dialogDelete" max-width="440px" persistent>
      <v-card class="rounded-xl overflow-hidden">
        <v-card-title class="pa-5 d-flex align-center bg-light-error">
          <div class="delete-icon-box mr-3">
            <i class="fa-solid fa-triangle-exclamation text-error"></i>
          </div>
          <div>
            <h3 class="text-h6 font-weight-bold mb-0 text-error">Xác nhận xóa</h3>
            <span class="text-caption text-medium-emphasis">Hành động này không thể hoàn tác</span>
          </div>
        </v-card-title>

        <v-card-text class="pa-5">
          <p class="mb-2 text-body-1">
            Bạn có chắc chắn muốn xóa ứng dụng
            <strong class="text-high-emphasis">"{{ selectedApp?.name_app || 'này' }}"</strong>
            không?
          </p>
          <div v-if="selectedApp?.link_app" class="text-caption text-medium-emphasis text-truncate">
            <i class="bx bx-link mr-1"></i> {{ selectedApp.link_app }}
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="secondary"
            variant="tonal"
            :disabled="isDeleting"
            @click="dialogDelete = false"
          >
            Hủy
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :loading="isDeleting"
            prepend-icon="bx-trash"
            @click="confirmDelete"
          >
            Xóa ứng dụng
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import AppSettingCreateDialog from '@/pages/app-settings/AppSettingCreate.vue'
import AppSettingDetail from '@/pages/app-settings/AppSettingDetail.vue'
import AppSettingEditDialog from '@/pages/app-settings/AppSettingEdit.vue'
import AppSettingCard from '@/pages/app-settings/components/AppSettingCard.vue'
import AppSettingService from '@/services/app-settings.service'
import { useToast } from '@/stores/toast.store'
import { computed, onMounted, ref } from 'vue'

const toast = useToast()

// Data states
const appSettings = ref([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const viewMode = ref('list') // 'list' or 'grid'
const togglingIds = ref(new Set())

// Dialog states
const dialogCreate = ref(false)
const dialogEdit = ref(false)
const dialogDetail = ref(false)
const dialogDelete = ref(false)
const selectedApp = ref(null)
const isDeleting = ref(false)

// Status options for select filter
const statusOptions = [
  { title: 'Tất cả trạng thái', value: 'all' },
  { title: 'Đang bật (Active)', value: 'active' },
  { title: 'Đang tắt (Inactive)', value: 'inactive' },
]

// Computed statistics
const activeAppsCount = computed(() => {
  return appSettings.value.filter(app => app.is_active).length
})

const inactiveAppsCount = computed(() => {
  return appSettings.value.filter(app => !app.is_active).length
})

// Filtered apps list
const filteredApps = computed(() => {
  return appSettings.value.filter(item => {
    // Search query filter
    const query = (searchQuery.value || '').trim().toLowerCase()
    const matchesSearch =
      !query ||
      (item.name_app && item.name_app.toLowerCase().includes(query)) ||
      (item.link_app && item.link_app.toLowerCase().includes(query))

    // Status filter
    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'active' && Boolean(item.is_active)) ||
      (statusFilter.value === 'inactive' && !item.is_active)

    return matchesSearch && matchesStatus
  })
})

// Fetch all app settings
const fetchAppSettings = async () => {
  try {
    loading.value = true
    const response = await AppSettingService.list()
    appSettings.value = response || []
  } catch (error) {
    console.error('Error fetching app settings:', error)
    toast.show('Không thể tải danh sách ứng dụng!', 'error')
  } finally {
    loading.value = false
  }
}

// Reset filters
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'all'
}

// Open create dialog
const openCreateDialog = () => {
  dialogCreate.value = true
}

// Callback after create
const onAppCreated = (newApp) => {
  if (newApp) {
    appSettings.value.unshift(newApp)
  } else {
    fetchAppSettings()
  }
}

// Edit app
const editApp = (item) => {
  selectedApp.value = { ...item }
  dialogEdit.value = true
}

// Callback after update
const onAppUpdated = (updatedApp) => {
  if (updatedApp) {
    const idx = appSettings.value.findIndex(a => a.id === updatedApp.id)
    if (idx !== -1) {
      appSettings.value[idx] = updatedApp
    } else {
      fetchAppSettings()
    }
  } else {
    fetchAppSettings()
  }
}

// Detail dialog
const openDetail = (item) => {
  selectedApp.value = { ...item }
  dialogDetail.value = true
}

// Delete confirm dialog
const openDeleteConfirm = (item) => {
  selectedApp.value = { ...item }
  dialogDelete.value = true
}

// Confirm delete
const confirmDelete = async () => {
  if (!selectedApp.value?.id) return

  try {
    isDeleting.value = true
    await AppSettingService.delete(selectedApp.value.id)
    appSettings.value = appSettings.value.filter(a => a.id !== selectedApp.value.id)
    dialogDelete.value = false
    toast.show('Xóa ứng dụng thành công!', 'success')
  } catch (error) {
    console.error('Error deleting app setting:', error)
    toast.show('Xóa ứng dụng thất bại!', 'error')
  } finally {
    isDeleting.value = false
  }
}

// Direct toggle active switch/button
const toggleAppActive = async (item) => {
  if (!item?.id || togglingIds.value.has(item.id)) return

  const targetId = item.id
  const nextStatus = !item.is_active
  const previousStatus = item.is_active

  // Optimistic update
  item.is_active = nextStatus
  togglingIds.value.add(targetId)

  try {
    const updated = await AppSettingService.toggleActive(targetId, nextStatus)
    if (updated) {
      const idx = appSettings.value.findIndex(a => a.id === targetId)
      if (idx !== -1) {
        appSettings.value[idx] = updated
      }
    }
    toast.show(
      `Đã ${nextStatus ? 'bật' : 'tắt'} ứng dụng "${item.name_app || ''}"!`,
      nextStatus ? 'success' : 'info'
    )
  } catch (error) {
    console.error('Error toggling app status:', error)
    // Revert optimistic update
    item.is_active = previousStatus
    toast.show('Không thể thay đổi trạng thái ứng dụng!', 'error')
  } finally {
    togglingIds.value.delete(targetId)
  }
}

// Copy link to clipboard
const copyLink = async (link) => {
  if (!link) return
  try {
    await navigator.clipboard.writeText(link)
    toast.show('Đã sao chép liên kết!', 'success')
  } catch (err) {
    console.error('Clipboard error:', err)
  }
}

// Format date helper
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

onMounted(() => {
  fetchAppSettings()
})
</script>

<style scoped>
.app-settings-page {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-card {
  border-radius: 12px;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.stat-badge {
  display: flex;
  flex-direction: column;
  padding: 6px 14px;
  border-radius: 8px;
  min-width: 90px;
}

.stat-count {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-transform: uppercase;
  font-weight: 600;
}

.stat-all {
  background-color: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
}

.stat-active {
  background-color: rgba(var(--v-theme-success), 0.1);
  color: rgb(var(--v-theme-success));
}

.stat-inactive {
  background-color: rgba(var(--v-theme-on-surface), 0.06);
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.toolbar-card {
  border-radius: 12px;
}

.btn-add {
  letter-spacing: 0.3px;
}

.table-card {
  border-radius: 12px;
}

.app-table {
  width: 100%;
}

.app-table thead th {
  font-weight: 600 !important;
  font-size: 0.8rem !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
  background-color: rgba(var(--v-theme-on-surface), 0.02) !important;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08) !important;
}

.app-table tbody tr {
  transition: background-color 0.2s ease;
}

.app-table tbody tr:hover {
  background-color: rgba(var(--v-theme-primary), 0.03);
}

.row-inactive {
  opacity: 0.75;
}

.app-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.badge-active {
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}

.badge-inactive {
  background: rgba(var(--v-theme-on-surface), 0.08);
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.app-name {
  color: rgb(var(--v-theme-on-surface));
}

.link-preview {
  max-width: 280px;
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  font-size: 0.88rem;
}

.link-preview:hover {
  text-decoration: underline;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.dot-active {
  background-color: rgb(var(--v-theme-success));
  box-shadow: 0 0 6px rgba(var(--v-theme-success), 0.6);
}

.dot-inactive {
  background-color: rgba(var(--v-theme-on-surface), 0.4);
}

.action-buttons .v-btn {
  border-radius: 6px;
}

.empty-card {
  border-radius: 12px;
}

.empty-icon-wrap {
  opacity: 0.4;
}

.delete-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: rgba(var(--v-theme-error), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

.gap-4 {
  gap: 16px;
}

@media (max-width: 600px) {
  .link-preview {
    max-width: 160px;
  }
}
</style>
