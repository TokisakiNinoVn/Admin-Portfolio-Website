<template>
  <v-row class="">
    <!-- Toolbar Sticky -->
    <v-col cols="12" class="toolbar-sticky z-index-10" :class="{ 'toolbar-hidden': isToolbarHidden }">
      <v-card class="mb-2" elevation="2">
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" sm="12" md="3">
              <v-text-field
                v-model="searchQuery"
                label="Tìm kiếm đợt thi"
                variant="outlined"
                clearable
                hide-details
              />
            </v-col>
            <!-- Nút thêm chủ đề -->
            <v-col cols="12" sm="6" md="3" class="d-flex justify-end align-center btn-add-campaign">
              <v-btn color="primary" variant="outlined" @click="dialog = true">
                <i class="fa-solid fa-plus mr-2"></i>
                Thêm đợt thi mới
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Campaign Cards Grid -->
    <v-col
      v-for="(item, index) in filteredCampaigns"
      :key="item.id"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <v-card elevation="2" class="d-flex flex-column h-100 campaign-card">
        <CampaignCard
          :campaign="item"
          @view="openCampaignDetail"
          @edit="editCampaign"
          @view-papers="viewPapers"
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

  <!-- Dialog tạo chủ đề -->
  <CampaignCreateDialog v-model:dialog="dialog" @created="fetchCampaigns" />
  <!-- Dialog chỉnh sửa chủ đề -->
  <CampaignEditDialog
    v-model:dialog="editDialog"
    :campaign="selectedCampaign"
    @updated="fetchCampaigns"
  />

  <CampaignDetailDialog
    v-model:dialog="detailDialog"
    :campaign="selectedCampaign"
    @updated="fetchCampaigns"
  />

  <!-- Dialog xem chi tiết (đã sửa theo cấu trúc mới) -->
  <!-- <v-dialog v-model="detailDialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h5">{{ selectedCampaign?.name }}</v-card-title>
      <v-card-text>
        <p><strong>Mô tả:</strong> {{ selectedCampaign?.description }}</p>
        <p><strong>Số lượng ngân hàng câu hỏi:</strong> {{ selectedCampaign?.question_banks_count || 0 }}</p>
        <p><strong>Ngày tạo:</strong> {{ formatDate(selectedCampaign?.created_at) }}</p>
        <p><strong>Ngày cập nhật:</strong> {{ formatDate(selectedCampaign?.updated_at) }}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="detailDialog = false">Đóng</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog> -->

  <!-- Dialog xác nhận xóa -->
  <v-dialog v-model="deleteDialog" max-width="400px">
    <v-card>
      <v-card-title class="text-h6 bg-primary text-white">Xác nhận xóa</v-card-title>
      <v-card-text class="text-center">
        <span class="font-weight-bold text-h6">Bạn có chắc chắn muốn xóa đợt thi</span>
        <p class="font-weight-bold text-h5 mt-2 text-primary">"{{ selectedCampaign?.title }}" ?</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="deleteDialog = false">Hủy</v-btn>
        <v-btn color="error" variant="text" @click="confirmDelete">Xóa</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Component Danh sách bài học (BÊN PHẢI) -->
  <!-- <LessonListPanel
    v-model:show="lessonListVisible"
    :campaign="selectedCampaign"
    :lessons="demoListLessonOfCampaign"
    @add-lesson="addLessonToCampaign"
    @remove-lesson="removeLessonFromCampaign"
  /> -->
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { deleteCampaignApi, listCampaignApi } from '@/apis/modules/campaign.api'
import CampaignCreateDialog from '@/pages/campaign/CampaignCreate.vue'
import CampaignDetailDialog from '@/pages/campaign/CampaignDetail.vue'
import CampaignEditDialog from '@/pages/campaign/CampaignEdit.vue'
import CampaignCard from '@/pages/campaign/components/CampaignCard.vue'
import { useToast } from '@/stores/toast.store'

const campaigns = ref([])
const searchQuery = ref('')
const dialog = ref(false)
const editDialog = ref(false)
const detailDialog = ref(false)
const deleteDialog = ref(false)
const lessonListVisible = ref(false)
const selectedCampaign = ref(null)
const toast = useToast()
const isToolbarHidden = ref(false)
const showScrollToTop = ref(false)
const lastScrollPosition = ref(0)
const router = useRouter()

const createDialog = ref(false);

// Dữ liệu mẫu cho danh sách bài học (có thể thay bằng API thực tế)
const demoListLessonOfCampaign = ref([])

// Hàm định dạng ngày tháng
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN')
}
// const campaignForm = ref({
//     title: '',
//     description: '',
//     start_time: '',
//     end_time: '',
//     duration_minutes: 45,
//     allow_skill_navigation: false,
//     auto_submit: true
// });
// Lọc chủ đề theo từ khóa tìm kiếm (chỉ dựa trên name và description)
const filteredCampaigns = computed(() => {
  const query = (searchQuery.value || '').toLowerCase()
  if (!query) return campaigns.value
  return campaigns.value.filter((campaign) => {
    return (
      (campaign.name && campaign.name.toLowerCase().includes(query)) ||
      (campaign.description && campaign.description.toLowerCase().includes(query))
    )
  })
})

// Lấy danh sách chủ đề từ API
const fetchCampaigns = async () => {
  try {
    const response = await listCampaignApi()
    
    if (response.data.data.length > 0) {
        campaigns.value = response.data.data.map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        start_time: campaign.start_time,
        end_time: campaign.end_time,
        duration_minutes: campaign.duration_minutes,
        allow_skill_navigation: campaign.allow_skill_navigation,
        auto_submit: campaign.auto_submit,
        created_at: campaign.created_at,
        updated_at: campaign.updated_at
      }))
    }
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    toast.show('Không thể tải danh sách chủ đề', 'error')
  }
}

const openCampaignDetail = (campaign) => {
  selectedCampaign.value = { ...campaign }
  detailDialog.value = true
}

const viewPapers = (campaign) => {
  selectedCampaign.value = { ...campaign }
  router.push({
    name: 'campaign-papers',
    params: {
      campaignId: campaign.id
    }
  })
}

const openDeleteConfirm = (campaign) => {
  selectedCampaign.value = { ...campaign }
  deleteDialog.value = true
}

const confirmDelete = async () => {
  const id = selectedCampaign.value.id;
  try {
    await deleteCampaignApi(id)
    campaigns.value = campaigns.value.filter((campaign) => campaign.id !== id)
    deleteDialog.value = false
    setTimeout(() => {
      selectedCampaign.value = null
    }, 300)
    toast.show('Xóa chủ đề thành công!', 'success')
  } catch (error) {
    console.error('Error deleting campaign:', error)
    toast.show('Xóa chủ đề thất bại', 'error')
  }
}

const editCampaign = (campaign) => {
  selectedCampaign.value = { ...campaign }
  editDialog.value = true
}

// Thêm bài học vào chủ đề (demo)
// const addLessonToCampaign = (lesson) => {
//   if (!demoListLessonOfCampaign.value.some(l => l.id === lesson.id)) {
//     demoListLessonOfCampaign.value.push(lesson)
//     toast.show(`Đã thêm "${lesson.title}" vào chủ đề`, 'success')
//   } else {
//     toast.show('Bài học đã có trong chủ đề', 'warning')
//   }
// }

// // Xóa bài học khỏi chủ đề (demo)
// const removeLessonFromCampaign = (lessonId) => {
//   const lessonIndex = demoListLessonOfCampaign.value.findIndex(l => l.id === lessonId)
//   if (lessonIndex !== -1) {
//     const removedLesson = demoListLessonOfCampaign.value[lessonIndex]
//     demoListLessonOfCampaign.value.splice(lessonIndex, 1)
//     toast.show(`Đã xóa "${removedLesson.title}" khỏi chủ đề`, 'success')
//   }
// }

// Reset selectedCampaign khi các dialog đóng
watch([editDialog, detailDialog, deleteDialog, lessonListVisible], ([edit, detail, del, lessonList]) => {
  if (!edit && !detail && !del && !lessonList) {
    setTimeout(() => {
      selectedCampaign.value = null
    }, 300)
  }
})

// Xử lý scroll để ẩn/hiện toolbar và nút lên đầu trang
const handleScroll = () => {
  const currentScrollPosition = window.pageYOffset
  const isMobileOrTablet = window.innerWidth <= 1024

  if (isMobileOrTablet) {
    isToolbarHidden.value = currentScrollPosition > lastScrollPosition.value && currentScrollPosition > 100
  }

  showScrollToTop.value = currentScrollPosition > 300
  lastScrollPosition.value = currentScrollPosition
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  fetchCampaigns()
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
  transition: transform 0.3s ease;
  z-index: 100;
}

.toolbar-hidden {
  transform: translateY(-100%);
}

.z-index-10 {
  z-index: 10;
}

.scroll-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
}

.campaign-card {
  transition: all 0.3s ease;
}

.campaign-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.v-card.campaign-card {
  margin-bottom: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.v-card.campaign-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.btn-add-campaign .v-btn {
  font-weight: 500;
  font-size: 14px;
  padding: 8px 16px;
}

.btn-add-campaign .v-btn i {
  margin-right: 8px;
}

@media screen and (max-width: 1024px) {
  .btn-add-campaign .v-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
