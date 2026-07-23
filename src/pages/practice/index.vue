<template>
  <v-row class="mt-2">
    <!-- Toolbar Sticky -->
    <v-col cols="12" class="toolbar-sticky z-index-10" :class="{ 'toolbar-hidden': isToolbarHidden }">
      <v-card class="mb-2" elevation="2">
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" sm="6" md="9">
              <v-text-field
                v-model="searchQuery"
                label="Tìm kiếm bài kiểm tra, bộ đề..."
                variant="outlined"
                clearable
                hide-details
              />
            </v-col>
            <!-- Nút thêm bài kiểm tra -->
            <v-col cols="12" sm="6" md="3" class="d-flex justify-end align-center btn-add-practice">
              <v-btn color="primary" variant="outlined" @click="dialog = true">
                <i class="fa-solid fa-plus mr-2"></i>
                Thêm bài kiểm tra mới
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Practice Cards Grid -->
    <v-col
      v-for="(item, index) in filteredPractices"
      :key="item.id"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <v-card elevation="2" class="d-flex flex-column h-100 practice-card">
        <PracticeCard
          :practice="item"
          @view="openPracticeDetail"
          @edit="editPractice"
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

  <!-- Dialog tạo bài kiểm tra -->
  <PracticeCreate v-model:dialog="dialog" @created="fetchPractices" />

  <!-- Dialog chỉnh sửa bài kiểm tra -->
  <PracticeEditDialog
    v-model:dialog="editDialog"
    :practice="selectedPractice"
    @updated="fetchPractices"
  />

  <!-- Dialog xem chi tiết -->
  <v-dialog v-model="detailDialog" max-width="700px">
    <v-card>
      <v-card-title class="text-h5 title-detail">{{ selectedPractice?.title }}</v-card-title>
      <v-card-text>
        <!-- <p><strong>ID:</strong> {{ selectedPractice?.id }}</p> -->
        <p><strong>Mô tả:</strong> {{ selectedPractice?.description }}</p>
        <p><strong>Thời gian:</strong> {{ selectedPractice?.limit_time }} phút</p>
        <p><strong>Hạn nộp:</strong> {{ formatDateTime(selectedPractice?.due_date) }}</p>
        <p><strong>Đăng bởi:</strong> {{ getUploaderText(selectedPractice?.upload_by) }}</p>
        <p><strong>Ngày tạo:</strong> {{ formatDateTime(selectedPractice?.created_at) }}</p>
        <p><strong>Ngày cập nhật:</strong> {{ formatDateTime(selectedPractice?.updated_at) }}</p>
        
        <!-- Danh sách Activity -->
        <v-divider class="my-4"></v-divider>
        <h4 class="text-h6 mb-3">Danh sách Activity</h4>
        <v-list v-if="practiceActivities.length > 0" class="activity-list" style="max-height: 300px; overflow-y: auto;">
          <v-list-item
            v-for="activity in practiceActivities"
            :key="activity.id"
            class="mb-2"
          >
            <v-card variant="outlined" class="w-100">
              <v-card-text class="py-2">
                <div><strong>{{ activity.title }}</strong></div>
                <div class="">{{ activity.caculated_text || 'Không có mô tả' }}</div>
                <!-- <div class="text-caption">
                  <span class="text-blue">ID: {{ activity.id }}</span> | 
                  <span class="text-green">Type: {{ activity.type }}</span>
                </div> -->
              </v-card-text>
            </v-card>
          </v-list-item>
        </v-list>
        <div v-else class="text-center py-4">
          <p>Không có activity nào trong bài kiểm tra này</p>
        </div>
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
        Bạn có chắc chắn muốn xóa bài kiểm tra "{{ selectedPractice?.title }}"?
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
import { deletePracticeApi, detailsPracticeApi, listPracticeApi } from '@/apis/modules/practice.api'
import PracticeCard from '@/pages/practice/components/PracticeCard.vue'
import PracticeCreate from '@/pages/practice/PracticeCreate.vue'
import PracticeEditDialog from '@/pages/practice/PracticeEdit.vue'
import { useToast } from '@/stores/toast.store'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const practices = ref([])
const searchQuery = ref('')
const dialog = ref(false)
const editDialog = ref(false)
const detailDialog = ref(false)
const deleteDialog = ref(false)
const selectedPractice = ref(null)
const practiceActivities = ref([]) // Danh sách activity của practice được chọn
const isLoadingActivities = ref(false)
const toast = useToast()
const isToolbarHidden = ref(false)
const showScrollToTop = ref(false)
const lastScrollPosition = ref(0)

const filteredPractices = computed(() => {
  const query = searchQuery.value.toLowerCase() || ''
  return practices.value.filter((practice) =>
    (practice.title?.toLowerCase().includes(query) || false) ||
    (practice.description?.toLowerCase().includes(query) || false)
  )
})

const fetchPractices = async () => {
  try {
    const response = await listPracticeApi()
    practices.value = response.data.data
  } catch (error) {
    console.error('Error fetching practices:', error)
  }
}

const fetchPracticeActivities = async (practiceId) => {
  try {
    isLoadingActivities.value = true
    const response = await detailsPracticeApi(practiceId)
    practiceActivities.value = response.data.test.activities || []

  } catch (error) {
    console.error('Error fetching practice activities:', error)
    toast.show('Không thể tải danh sách activity!', 'error')
    practiceActivities.value = []
  } finally {
    isLoadingActivities.value = false
  }
}

const openPracticeDetail = async (practice) => {
  selectedPractice.value = practice
  detailDialog.value = true
  // Gọi API để lấy danh sách activity khi mở dialog chi tiết
  await fetchPracticeActivities(practice.id)
}

const openDeleteConfirm = (practice) => {
  selectedPractice.value = practice
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await deletePracticeApi(selectedPractice.value.id)
    practices.value = practices.value.filter((t) => t.id !== selectedPractice.value.id)
    deleteDialog.value = false
    selectedPractice.value = null
    toast.show('Xóa bài kiểm tra thành công!', 'success')
  } catch (error) {
    console.error('Error deleting practice:', error)
    toast.show('Xóa bài kiểm tra thất bại!', 'error')
  }
}

const editPractice = (practice) => {
  selectedPractice.value = practice
  editDialog.value = true
}

const getUploaderText = (uploadBy) => {
  return uploadBy === 'teacher' ? 'Giáo viên' : 'Hệ thống'
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN')
}

const handleScroll = () => {
  const currentScrollPosition = window.pageYOffset
  const isMobileOrTablet = window.innerWidth <= 1024

  if (isMobileOrTablet) {
    if (currentScrollPosition > lastScrollPosition.value && currentScrollPosition > 100) {
      isToolbarHidden.value = true
    } else {
      isToolbarHidden.value = false
    }
  }
  showScrollToTop.value = currentScrollPosition > 300
  lastScrollPosition.value = currentScrollPosition
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Reset activities khi đóng dialog
watch(() => detailDialog.value, (val) => {
  if (!val) {
    practiceActivities.value = []
  }
})

onMounted(() => {
  fetchPractices()
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

.v-card.practice-card {
  margin-bottom: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.v-card.practice-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.btn-add-practice {
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

/* Custom scrollbar for activity list */
.activity-list::-webkit-scrollbar {
  width: 6px;
}

.activity-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.activity-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media screen and (max-width: 1024px) {
  .btn-add-practice {
    .v-btn {
      width: 100%;
      justify-content: center;
    }
  }
}
.title-detail  {
  background-color: #2196f3;
  color: white;
  font-weight: 600;
  box-shadow: rgba(17, 17, 26, 0.1) 0px 4px 16px, rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 56px;
}
</style>
