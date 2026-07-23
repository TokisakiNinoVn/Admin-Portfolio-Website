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
                label="Tìm kiếm chủ đề"
                variant="outlined"
                clearable
                hide-details
              />
            </v-col>
            <!-- Lọc theo loại skill type -->
             <VSelect
              v-model="selectedSkillType"
              :items="SpeakingWritingSkillOptions"
              item-title="title"
              item-value="value"
              label="Kỹ năng"
              variant="outlined"
              clearable
              hide-details
            />
            <!-- Nút thêm chủ đề -->
            <v-col cols="12" sm="6" md="3" class="d-flex justify-end align-center btn-add-topic">
              <v-btn color="primary" variant="outlined" @click="dialog = true">
                <i class="fa-solid fa-plus mr-2"></i>
                Thêm rubrics mới
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Rubric Cards Grid -->
    <v-col
      v-for="(item, index) in filteredRubrics"
      :key="item.id"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <v-card elevation="2" class="d-flex flex-column h-100 topic-card">
        <RubricCard
          :rubric="item"
          @view="openRubricDetail"
          @edit="editRubric"
          @lesson="openLessonList"
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
  <RubricCreateDialog v-model:dialog="dialog" @created="fetchRubrics" />
  <!-- Dialog chỉnh sửa chủ đề -->
  <RubricEditDialog
    v-model:dialog="editDialog"
    :rubric="selectedRubric"
    @updated="fetchRubrics"
  />

  <!-- Dialog xem chi tiết (đã sửa theo cấu trúc mới) -->
  <!-- <v-dialog v-model="detailDialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h5">{{ selectedRubric?.name }}</v-card-title>
      <v-card-text>
        <p><strong>Mô tả:</strong> {{ selectedRubric?.description }}</p>
        <p><strong>Số lượng ngân hàng câu hỏi:</strong> {{ selectedRubric?.question_banks_count || 0 }}</p>
        <p><strong>Ngày tạo:</strong> {{ formatDate(selectedRubric?.created_at) }}</p>
        <p><strong>Ngày cập nhật:</strong> {{ formatDate(selectedRubric?.updated_at) }}</p>
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
      <v-card-title class="text-h6">Xác nhận xóa</v-card-title>
      <v-card-text>
        Bạn có chắc chắn muốn xóa chủ đề "{{ selectedRubric?.name }}"?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="deleteDialog = false">Hủy</v-btn>
        <v-btn color="error" variant="text" @click="confirmDelete">Xóa</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <RubricDetailDialog
    v-model:dialog="detailDialog"
    :rubric="selectedRubric"
    @close="detailDialog = false"
  />
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

// import { deleteRubricApi, listRubricApi } from '@/apis/modules/topic.api'
import RubricCard from '@/pages/rubric/components/RubricCard.vue'
// import LessonListPanel from '@/pages/topic/LessonListPanel.vue'
import { SpeakingWritingSkillOptions } from '@/helpers/skill-type.helper'
import RubricCreateDialog from '@/pages/rubric/RubricCreate.vue'
import RubricDetailDialog from '@/pages/rubric/RubricDetail.vue'
import RubricEditDialog from '@/pages/rubric/RubricEdit.vue'
import RubricService from '@/services/rubric.service'
import { useToast } from '@/stores/toast.store'

const rubrics = ref([])

const searchQuery = ref('')
const dialog = ref(false)
const editDialog = ref(false)
const detailDialog = ref(false)
const deleteDialog = ref(false)
const lessonListVisible = ref(false)
const selectedSkillType = ref(null)
const selectedRubric = ref(null)
const toast = useToast()
const isToolbarHidden = ref(false)
const showScrollToTop = ref(false)
const lastScrollPosition = ref(0)

// Dữ liệu mẫu cho danh sách bài học (có thể thay bằng API thực tế)
const demoListLessonOfRubric = ref([])

// Hàm định dạng ngày tháng
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

// Lọc chủ đề theo từ khóa tìm kiếm (chỉ dựa trên name và description)
const filteredRubrics = computed(() => {
  const query = (searchQuery.value || '').toLowerCase()
  if (!query) return rubrics.value
  return rubrics.value.filter((rubric) => {
    return (
      (rubric.name && rubric.name.toLowerCase().includes(query)) ||
      (rubric.description && rubric.description.toLowerCase().includes(query))
    )
  })
})

// Lấy danh sách chủ đề từ API
const fetchRubrics = async () => {
  try {
    const response = await RubricService.list()
    if (response.length > 0) {
        rubrics.value = response.map((rubric) => ({
        id: rubric.id,
        name: rubric.name,
        description: rubric.description,
        created_at: rubric.created_at,
        updated_at: rubric.updated_at,
        skill_type: rubric.skill_type,
        criteria: rubric.criteria
      }))
    }
  } catch (error) {
    console.error('Error fetching rubrics:', error)
    toast.show('Không thể tải danh sách chủ đề', 'error')
  }
}

const openRubricDetail = (topic) => {
  selectedRubric.value = { ...topic }
  detailDialog.value = true
}

const openLessonList = (topic) => {
  selectedRubric.value = { ...topic }
  lessonListVisible.value = true
}

const openDeleteConfirm = (topic) => {
  selectedRubric.value = { ...topic }
  deleteDialog.value = true
}

const confirmDelete = async () => {
  const id = selectedRubric.value.id;
  try {
    await RubricService.delete(id)
    rubrics.value = rubrics.value.filter((topic) => topic.id !== id)
    deleteDialog.value = false
    setTimeout(() => {
      selectedRubric.value = null
    }, 300)
    toast.show('Xóa chủ đề thành công!', 'success')
  } catch (error) {
    console.error('Error deleting topic:', error)
    toast.show('Xóa chủ đề thất bại', 'error')
  }
}

const editRubric = (topic) => {
  selectedRubric.value = { ...topic }
  editDialog.value = true
}

// Lọc chủ đề theo skill type
watch(selectedSkillType, (value) => {
  if (value) {
    rubrics.value = rubrics.value.filter((rubric) => rubric.skill_type === value)
  } else {
    fetchRubrics()
  }
})

// Reset selectedRubric khi các dialog đóng
watch([editDialog, detailDialog, deleteDialog, lessonListVisible], ([edit, detail, del, lessonList]) => {
  if (!edit && !detail && !del && !lessonList) {
    setTimeout(() => {
      selectedRubric.value = null
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
  fetchRubrics()
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

.topic-card {
  transition: all 0.3s ease;
}

.topic-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.v-card.topic-card {
  margin-bottom: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.v-card.topic-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.btn-add-topic .v-btn {
  font-weight: 500;
  font-size: 14px;
  padding: 8px 16px;
}

.btn-add-topic .v-btn i {
  margin-right: 8px;
}

@media screen and (max-width: 1024px) {
  .btn-add-topic .v-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
