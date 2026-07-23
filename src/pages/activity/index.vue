<template>
  <v-row class="mt-2">
    <!-- Toolbar Sticky -->
    <v-col cols="12" class="toolbar-sticky z-index-10" :class="{ 'toolbar-hidden': isToolbarHidden }">
      <v-card class="mb-2" elevation="2">
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" sm="12" md="3">
              <v-text-field
                v-model="searchQuery"
                label="Tìm kiếm bài học"
                variant="outlined"
                clearable
                hide-details
              />
            </v-col>
            <!-- <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedType"
                :items="types"
                item-title="title"
                item-value="value"
                label="Lọc theo loại"
                variant="outlined"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedLevel"
                :items="levels"
                item-title="title"
                item-value="value"
                label="Lọc theo độ khó"
                variant="outlined"
                clearable
                hide-details
              />
            </v-col> -->

            <!-- Nút thêm bài học -->
            <!-- <v-col cols="12" sm="6" md="3" class="d-flex justify-end align-center btn-add-activity">
              <v-btn color="primary" variant="outlined" @click="dialog = true">
                <i class="fa-solid fa-plus mr-2"></i>
                Thêm bài học mới
              </v-btn>
            </v-col> -->
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Activity Cards Grid -->
    <v-col
      v-for="(item, index) in filteredActivitys"
      :key="item.id"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <v-card elevation="2" class="d-flex flex-column h-100 activity-card">
        <ActivityCard
          :activity="item"
          @view="openActivityDetail"
          @edit="editActivity"
          @delete="openDeleteConfirm"
        />
      </v-card>
    </v-col>

    <!-- Scroll to Top Button -->
    <v-btn
      v-if="showScrollToTop"
      class="scroll-to-top"
      color="primary"
      fab
      small
      @click="scrollToTop"
    >
      <i class="fa-solid fa-jet-fighter-up"></i>
    </v-btn>
  </v-row>

  <!-- Dialog tạo bài học -->
  <ActivityCreateDialog v-model:dialog="dialog" @created="fetchActivitys" />
  <!-- Dialog chỉnh sửa bài học -->
  <ActivityEditDialog
    v-model:dialog="editDialog"
    :activity="selectedActivity"
    @updated="fetchActivitys"
  />

  <ActivityDetail
    v-model:dialog="detailDialog"
    :activity="selectedActivity"
    :types="types"
  />

  <!-- Dialog xem chi tiết -->
  <v-dialog v-model="detailDialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h5">{{ selectedActivity?.title }}</v-card-title>
      <v-card-text>
        <!-- <v-img
          :src="formatURLImage(selectedActivity?.cover)"
          :alt="selectedActivity?.title"
          height="200"
          class="mb-4"
        /> -->
        <p><strong>Mô tả:</strong> {{ selectedActivity?.description }}</p>
        <!-- <p><strong>Thời gian:</strong> {{ selectedActivity?.limit_time }} phút</p>
        <p><strong>Độ khó:</strong> {{ selectedActivity?.level }}</p>
        <p><strong>Loại:</strong> {{ types.find(t => t.value === selectedActivity?.type)?.title || selectedActivity?.type }}</p> -->
        <p><strong>Đăng bởi:</strong> {{ selectedActivity?.upload_by === 'teacher' ? 'Giáo viên' : 'Hệ thống' }}</p>
        <p><strong>Ngày tạo:</strong> {{ new Date(selectedActivity?.created_at).toLocaleDateString() }}</p>
        <p><strong>Ngày cập nhật:</strong> {{ new Date(selectedActivity?.updated_at).toLocaleDateString() }}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="detailDialog = false">Đóng</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog xác nhận xóa -->
  <v-dialog v-model="deleteDialog" max-width="400px">
    <v-card>
      <v-card-title class="text-h6">Xác nhận xóa</v-card-title>
      <v-card-text>
        Bạn có chắc chắn muốn xóa bài học "{{ selectedActivity?.title }}"?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="deleteDialog = false">Hủy</v-btn>
        <v-btn color="error" variant="text" @click="confirmDelete">Xóa</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { deleteActivityApi, listActivityApi } from '@/apis/modules/activity.api'
import ActivityCreateDialog from '@/pages/activity/ActivityCreate.vue'
import ActivityDetail from '@/pages/activity/ActivityDetail.vue'
import ActivityEditDialog from '@/pages/activity/ActivityEdit.vue'
import ActivityCard from '@/pages/activity/components/ActivityCard.vue'
import { useToast } from '@/stores/toast.store'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const activitys = ref([])
const searchQuery = ref('')
const selectedType = ref(null)
const selectedLevel = ref(null)
const dialog = ref(false)
const editDialog = ref(false)
const detailDialog = ref(false)
const deleteDialog = ref(false)
const selectedActivity = ref(null)
const toast = useToast()
const isToolbarHidden = ref(false)
const showScrollToTop = ref(false)
const lastScrollPosition = ref(0)

const types = [
  { title: 'Thực hành giao tiếp', value: 'conversation'},
  { title: 'Từng từ', value: 'word' },
  { title: 'Hội thoại', value: 'sentences' },
  { title: 'Ngữ pháp', value: 'grammar' },
]

const filteredActivitys = computed(() => {
  return activitys.value.filter((activity) => {
    const query = (searchQuery.value || '').toLowerCase()
    const matchesSearch =
      activity.title.toLowerCase().includes(query) ||
      (activity.description && activity.description.toLowerCase().includes(query))
    const matchesType = !selectedType.value || activity.type === selectedType.value
    const matchesLevel = !selectedLevel.value || activity.level === selectedLevel.value
    return matchesSearch && matchesType && matchesLevel
  })
})

const fetchActivitys = async () => {
  try {
    const response = await listActivityApi()
    activitys.value = response.data.data.map((activity) => ({
      ...activity,
      category: activity.type,
    }))
  } catch (error) {
    console.error('Error fetching activitys:', error)
  }
}

const openActivityDetail = (activity) => {
  // Tạo bản sao để tránh tham chiếu
  selectedActivity.value = { ...activity }
  detailDialog.value = true
}

const openDeleteConfirm = (activity) => {
  // Tạo bản sao để tránh tham chiếu
  selectedActivity.value = { ...activity }
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await deleteActivityApi({ activity_id: selectedActivity.value.id })
    activitys.value = activitys.value.filter((activity) => activity.id !== selectedActivity.value.id)
    deleteDialog.value = false
    // Reset sau khi xóa
    setTimeout(() => {
      selectedActivity.value = null
    }, 300)
    toast.show('Xóa bài học thành công!', 'success')
  } catch (error) {
    console.error('Error deleting activity:', error)
  }
}

const editActivity = (activity) => {
  console.log('Editing activity:', activity)
  // Tạo bản sao để tránh tham chiếu
  selectedActivity.value = { ...activity }
  editDialog.value = true
}

// Reset selectedActivity khi các dialog đóng
watch([editDialog, detailDialog, deleteDialog], ([edit, detail, del]) => {
  if (!edit && !detail && !del) {
    setTimeout(() => {
      selectedActivity.value = null
    }, 300)
  }
})

const handleScroll = () => {
  const currentScrollPosition = window.pageYOffset
  const isMobileOrTablet = window.innerWidth <= 1024

  // Handle toolbar visibility
  if (isMobileOrTablet) {
    if (currentScrollPosition > lastScrollPosition.value && currentScrollPosition > 100) {
      isToolbarHidden.value = true
    } else {
      isToolbarHidden.value = false
    }
  }

  // Handle scroll-to-top button visibility
  showScrollToTop.value = currentScrollPosition > 300

  lastScrollPosition.value = currentScrollPosition
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  fetchActivitys()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.toolbar-sticky {
  position: sticky;
  top: 0;
  z-index: 10;
  padding-top: 8px;
  transition: transform 0.3s ease;
}

.toolbar-hidden {
  transform: translateY(-100%);
}

.v-card.activity-card {
  margin-bottom: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.v-card.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.btn-add-activity {
  .v-btn {
    font-weight: 500;
    font-size: 14px;
    padding: 8px 16px;
    i {
      margin-right: 8px;
    }
  }
}

.scroll-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  transition: opacity 0.3s ease;
}

@media screen and (max-width: 1024px) {
  .btn-add-activity {
    .v-btn {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
