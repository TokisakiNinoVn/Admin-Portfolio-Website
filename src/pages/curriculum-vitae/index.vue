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
                label="Tìm kiếm danh mục kỹ năng"
                variant="outlined"
                clearable
                hide-details
              />
            </v-col>

            <!-- Nút thêm danh mục kỹ năng -->
            <v-col
              cols="12"
              sm="12"
              md="3"
              class="d-flex align-center justify-end btn-add-lesson"
            >
              <v-btn
                color="primary"
                variant="elevated"
                prepend-icon="bx-plus"
                @click="dialog = true"
              >
                Thêm CV mới
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- CV Cards Grid -->
    <v-col
      v-for="(item, index) in filteredLessons"
      :key="item.id"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <v-card elevation="2" class="d-flex flex-column h-100 curriculumVitaes-card">
        <CVCard
          :curriculumVitaes="item"
          @view="openLessonDetail"
          @edit="editCurriculumVitaes"
          @delete="openDeleteConfirm"
          @viewListActivity="viewListActivity"
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
  <AddCVDialog 
    v-model:dialog="dialog" 
    @created="fetchCurriculumVitae" 
    :arraySlugCV="arraySlugCV"
  />

  <!-- Dialog chỉnh sửa bài học -->
  <CurriculumVitaeEditDialog
    v-model:dialog="editDialog"
    :curriculumVitae="selectedCurriculumVitae"
    @updated="fetchCurriculumVitae"
  />

  <CurriculumVitaeDetail
    v-model:dialog="detailDialog"
    :curriculumVitaes="selectedSkillCategories"
  />

  <!-- Dialog xem chi tiết -->
  <v-dialog v-model="detailDialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h5 title-detail-unit">{{ selectedSkillCategories?.title }}</v-card-title>
      <v-card-text>
        <p><strong>Mô tả:</strong> {{ selectedSkillCategories?.description }}</p>
        <p><strong>Đăng bởi:</strong> {{ selectedSkillCategories?.upload_by === 'teacher' ? 'Giáo viên' : 'Hệ thống' }}</p>
        <p><strong>Ngày tạo:</strong> {{ new Date(selectedSkillCategories?.created_at).toLocaleDateString() }}</p>
        <p><strong>Ngày cập nhật:</strong> {{ new Date(selectedSkillCategories?.updated_at).toLocaleDateString() }}</p>
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
        Bạn có chắc chắn muốn xóa bài học "{{ selectedSkillCategories?.title }}"?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="deleteDialog = false">Hủy</v-btn>
        <v-btn color="error" variant="text" @click="confirmDelete">Xóa</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- <ActivityListPanel
    v-model:show="activityListVisible"
    :lesson="selectedLessonForActivities"
  /> -->
</template>


<script setup>
import AddCVDialog from '@/pages/curriculum-vitae/AddCVDialog.vue'
import CurriculumVitaeDetail from '@/pages/curriculum-vitae/CVDetail.vue'
// import CurriculumVitaeEditDialog from '@/pages/curriculum-vitae/CVEdit.vue'
import CurriculumVitaeEditDialog from '@/pages/curriculum-vitae/EditCVDialog.vue'
import CVCard from '@/pages/curriculum-vitae/components/CVCard.vue'
import CurriculumVitaeService from '@/services/curriculum-vitae.service'
import { useToast } from '@/stores/toast.store'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const curriculumVitaes = ref([])
const searchQuery = ref('')
const selectedType = ref(null)
const selectedLevel = ref(null)
const dialog = ref(false)
const editDialog = ref(false)
const detailDialog = ref(false)
const deleteDialog = ref(false)
const selectedSkillCategories = ref(null)
const toast = useToast()
const activityListVisible = ref(false)
const showScrollToTop = ref(false)
const lastScrollPosition = ref(0)
const selectedLessonForActivities = ref(null)
const selectedCurriculumVitae = ref(null)
const arraySlugCV = ref([])

const filteredLessons = computed(() => {
  return curriculumVitaes.value.filter((lesson) => {
    const query = (searchQuery.value || '').toLowerCase()
    const matchesSearch =
      lesson.title.toLowerCase().includes(query) ||
      (lesson.phone && lesson.phone.toLowerCase().includes(query))
    return matchesSearch
  })
})


const viewListActivity = (lesson) => {
  selectedLessonForActivities.value = lesson
  activityListVisible.value = true
}


const fetchCurriculumVitae = async () => {
  try {
    const response = await CurriculumVitaeService.list()
    curriculumVitaes.value = response
    arraySlugCV.value = response.map((item) => item.slug)
  } catch (error) {
    console.error('Error fetching curriculumVitae:', error)
  }
}

const openLessonDetail = (lesson) => {
  // Tạo bản sao để tránh tham chiếu
  selectedSkillCategories.value = { ...lesson }
  detailDialog.value = true
}

const openDeleteConfirm = (lesson) => {
  // Tạo bản sao để tránh tham chiếu
  selectedSkillCategories.value = { ...lesson }
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await CurriculumVitaeService.delete(selectedSkillCategories.value.id, 'images', selectedSkillCategories.value.avatar)
    curriculumVitaes.value = curriculumVitaes.value.filter((curriculumVitaes) => curriculumVitaes.id !== selectedSkillCategories.value.id)
    deleteDialog.value = false
    // Reset sau khi xóa
    setTimeout(() => {
      selectedSkillCategories.value = null
    }, 300)
    toast.show('Thao tác thành công!', 'success')
  } catch (error) {
    console.error('Error deleting curriculumVitaes:', error)
    toast.show('Thao tác thất bại!', 'error')
  }
}

const editCurriculumVitaes = (curriculumVitaes) => {
  selectedCurriculumVitae.value = { ...curriculumVitaes }
  editDialog.value = true
}

// Reset selectedSkillCategories khi các dialog đóng
watch([editDialog, detailDialog, deleteDialog], ([edit, detail, del]) => {
  if (!edit && !detail && !del) {
    setTimeout(() => {
      selectedCurriculumVitae.value = null
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
  fetchCurriculumVitae()
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

.v-card.lesson-card {
  margin-bottom: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.v-card.lesson-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.btn-add-lesson {
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
  .btn-add-lesson {
    .v-btn {
      width: 100%;
      justify-content: center;
    }
  }
}

.title-detail-unit {
  background-color: #2196f3;
  color: white;
  font-weight: 600;
  box-shadow: rgba(17, 17, 26, 0.1) 0px 4px 16px, rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 56px;
}
</style>
