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
                label="Tìm kiếm đề thi"
                variant="outlined"
                clearable
                hide-details
              />
            </v-col>
            <!-- Nút thêm đề thi -->
            <v-col cols="12" sm="6" md="3" class="d-flex justify-end align-center btn-add-paper">
              <v-btn color="primary" variant="outlined" @click="dialog = true">
                <i class="fa-solid fa-plus mr-2"></i>
                Tạo đề thi
              </v-btn>
            </v-col>
            <!-- Nút thêm đề thi ngẫu nhiên từ ngân hàng -->
            <v-col cols="12" sm="6" md="3" class="d-flex justify-end align-center btn-add-paper">
              <v-btn color="primary" variant="outlined" @click="dialog = true">
                <i class="fa-solid fa-plus mr-2"></i>
                Tạo đề thi ngẫu nhiên
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Paper Cards Grid -->
    <v-col
      v-for="(item, index) in filteredPapers"
      :key="item.id"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <v-card elevation="2" class="d-flex flex-column h-100 paper-card">
        <PaperCard
          :paper="item"
          @view="openPaperDetail"
          @edit="editPaper"
          @view-questions="handleViewQuestionPanel"
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
  <PaperCreateDialog 
    v-model:dialog="dialog" 
    :campaignId="campaignId"
    @created="fetchPapers" 
  />
  
  <!-- Dialog chỉnh sửa chủ đề -->
  <PaperEditDialog
    v-model:dialog="editDialog"
    :paper="selectedPaper"
    @updated="fetchPapers"
  />

  <PaperDetailDialog
    v-model:dialog="detailDialog"
    :paper="selectedPaper"
    @updated="fetchPapers"
  />

  <!-- Dialog xác nhận xóa -->
  <v-dialog v-model="deleteDialog" max-width="400px">
    <v-card>
      <v-card-title class="text-h6 bg-error text-white">Xác nhận xóa</v-card-title>
      <v-card-text>
        Bạn có chắc chắn muốn xóa đề thi "{{ selectedPaper?.title }}"?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="deleteDialog = false">Hủy</v-btn>
        <v-btn color="error" variant="text" @click="confirmDelete">Xóa</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Component Danh sách câu hỏi của đề thi -->
  <QuestionListPanel
    v-model:show="QuestionListVisible"
    v-if="QuestionListVisible"
    :paper="selectedPaper"
  />
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { deletePaperApi, listPaperByCampaignIdApi } from '@/apis/modules/paper.api'
import PaperCard from '@/pages/papers/components/PaperCard.vue'
import PaperCreateDialog from '@/pages/papers/PaperCreate.vue'
import PaperDetailDialog from '@/pages/papers/PaperDetail.vue'
import PaperEditDialog from '@/pages/papers/PaperEdit.vue'
import QuestionListPanel from '@/pages/papers/QuestionListPanel.vue'
import { useToast } from '@/stores/toast.store'

const toast = useToast()
const router = useRouter()
const route = useRoute()

const papers = ref([])
const searchQuery = ref('')
const lastScrollPosition = ref(0)
const campaignId = ref(null)
const demoListLessonOfPaper = ref([])

// display state
const dialog = ref(false)
const editDialog = ref(false)
const detailDialog = ref(false)
const deleteDialog = ref(false)
const QuestionListVisible = ref(false)
const selectedPaper = ref(null)
const isToolbarHidden = ref(false)
const showScrollToTop = ref(false)

// Dữ liệu mẫu cho danh sách bài học (có thể thay bằng API thực tế)

// Hàm định dạng ngày tháng
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN')
}
// const defaultForm = () => ({
//   title: '',
//   instruction: '',
//   random_mode: false,
//   sections: [defaultSection()]
// })
// Lọc chủ đề theo từ khóa tìm kiếm (chỉ dựa trên name và description)
const filteredPapers = computed(() => {
  const query = (searchQuery.value || '').toLowerCase()
  if (!query) return papers.value
  return papers.value.filter((paper) => {
    return (
      (paper.title && paper.title.toLowerCase().includes(query)) ||
      (paper.instruction && paper.instruction.toLowerCase().includes(query))
    )
  })
})

// Lấy danh sách chủ đề từ API
const fetchPapers = async () => {
  try {
    const response = await listPaperByCampaignIdApi(campaignId.value)
    
    if (response.data.length > 0) {
        papers.value = response.data.map((paper) => ({
          id: paper.id,
          title: paper.title,
          instruction: paper.instruction,
          random_mode: paper.random_mode,
          created_at: paper.created_at,
          sections: paper.sections,
          
        })) 
    } else {
      papers.value = [],
      toast.show('Không tìm thấy đề thi', 'info')
    }
  } catch (error) {
    console.error('Error fetching papers:', error)
    toast.show('Không thể tải danh sách chủ đề', 'error')
  }
}

const openPaperDetail = (paper) => {
  selectedPaper.value = { ...paper }
  detailDialog.value = true
}

const handleViewQuestionPanel = (paper) => {
  selectedPaper.value = { ...paper }
  QuestionListVisible.value = true;
}

const openDeleteConfirm = (paper) => {
  selectedPaper.value = { ...paper }
  deleteDialog.value = true
}

const confirmDelete = async () => {
  const id = selectedPaper.value.id;
  try {
    await deletePaperApi(id)
    papers.value = papers.value.filter((paper) => paper.id !== id)
    deleteDialog.value = false
    setTimeout(() => {
      selectedPaper.value = null
    }, 300)
    toast.show('Xóa chủ đề thành công!', 'success')
  } catch (error) {
    console.error('Error deleting paper:', error)
    toast.show('Xóa chủ đề thất bại', 'error')
  }
}

const editPaper = (paper) => {
  selectedPaper.value = { ...paper }
  editDialog.value = true
}



// Thêm bài học vào chủ đề (demo)
// const addLessonToPaper = (lesson) => {
//   if (!demoListLessonOfPaper.value.some(l => l.id === lesson.id)) {
//     demoListLessonOfPaper.value.push(lesson)
//     toast.show(`Đã thêm "${lesson.title}" vào chủ đề`, 'success')
//   } else {
//     toast.show('Bài học đã có trong chủ đề', 'warning')
//   }
// }

// // Xóa bài học khỏi chủ đề (demo)
// const removeLessonFromPaper = (lessonId) => {
//   const lessonIndex = demoListLessonOfPaper.value.findIndex(l => l.id === lessonId)
//   if (lessonIndex !== -1) {
//     const removedLesson = demoListLessonOfPaper.value[lessonIndex]
//     demoListLessonOfPaper.value.splice(lessonIndex, 1)
//     toast.show(`Đã xóa "${removedLesson.title}" khỏi chủ đề`, 'success')
//   }
// }

// Reset selectedPaper khi các dialog đóng
watch([editDialog, detailDialog, deleteDialog, QuestionListVisible], ([edit, detail, del, lessonList]) => {
  if (!edit && !detail && !del && !lessonList) {
    setTimeout(() => {
      selectedPaper.value = null
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
  campaignId.value = route.params.campaignId;
  fetchPapers()
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

.paper-card {
  transition: all 0.3s ease;
}

.paper-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.v-card.paper-card {
  margin-bottom: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.v-card.paper-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.btn-add-paper .v-btn {
  font-weight: 500;
  font-size: 14px;
  padding: 8px 16px;
}

.btn-add-paper .v-btn i {
  margin-right: 8px;
}

@media screen and (max-width: 1024px) {
  .btn-add-paper .v-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
