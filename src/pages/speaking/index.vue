<template>
  <v-row class="mt-2">
    <!-- Toolbar Sticky -->
    <v-col cols="12" class="toolbar-sticky z-index-10" :class="{ 'toolbar-hidden': isToolbarHidden }">
      <v-card class="mb-2" elevation="2">
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" sm="4" md="4">
              <v-text-field
                v-model="searchQuery"
                label="Tìm kiếm cuộc hội thoại"
                variant="outlined"
                clearable
                hide-details
              />
            </v-col>

            <!-- Nút thêm tài liệu -->
            <v-col cols="12" sm="4" md="4" class="d-flex justify-end align-center btn-add-document">
              <v-btn color="primary" variant="outlined" @click="dialog = true">
                <i class="fa-solid fa-plus mr-2"></i>
                Thêm cuộc hội thoại mới
              </v-btn>
            </v-col>

            <!-- nút add speaking pivot -->
            <v-col cols="12" sm="4" md="4" class="d-flex justify-end align-center btn-add-document">
              <v-btn color="primary" variant="outlined" @click="pivotDialog = true">
                <i class="fa-solid fa-plus mr-2"></i>
                Thêm speaking pivot
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Document Cards Grid -->
    <v-col
      v-for="(item, index) in filteredspeakings"
      :key="item.id"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <v-card elevation="2" class="d-flex flex-column h-100 document-card">
        <SpeakingCard
          :document="item"
          @view="openDocumentDetail"
          @edit="editDocument"
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

  <!-- Dialog tạo tài liệu -->
  <SpeakingCreate v-model:dialog="dialog" @created="fetchspeakings" />

  <!-- Dialog chỉnh sửa tài liệu -->
  <DocumentEditDialog
    v-model:dialog="editDialog"
    :document="selectedDocument"
    @updated="fetchspeakings"
  />

  <DocumentDetail
    v-model:dialog="detailDialog"
    :speaking="selectedDocument"
  />

  <!-- Dialog xác nhận xóa -->
  <v-dialog v-model="deleteDialog" max-width="400px">
    <v-card>
      <v-card-title class="text-h6">Xác nhận xóa</v-card-title>
      <v-card-text>
        Bạn có chắc chắn muốn xóa tài liệu "{{ selectedDocument?.name }}"?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="deleteDialog = false">Hủy</v-btn>
        <v-btn color="error" variant="text" @click="confirmDelete">Xóa</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog thêm speaking pivot -->
  <v-dialog v-model="pivotDialog" max-width="500px">
    <v-card>
      <v-card-title class="text-h6">Thêm Speaking Pivot</v-card-title>
      <v-card-text>
        <v-select
          v-model="selectedLessonId"
          :items="lessons"
          item-title="title"
          item-value="id"
          label="Chọn Lesson"
          variant="outlined"
          class="mb-4"
        />
        <v-select
          v-model="selectedSpeakingId"
          :items="speakings"
          item-title="content"
          item-value="id"
          label="Chọn Speaking"
          variant="outlined"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="pivotDialog = false">Hủy</v-btn>
        <v-btn color="primary" @click="confirmAddPivot">Xác nhận</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { listLessonApi } from '@/apis/modules/lesson.api'
import { addSpeakingPivot, deleteSpeakingApi, listSpeakingApi } from '@/apis/modules/speaking.api'
import SpeakingCard from '@/pages/speaking/components/SpeakingCard.vue'
import SpeakingCreate from '@/pages/speaking/SpeakingCreate.vue'
import DocumentDetail from '@/pages/speaking/SpeakingDetail.vue'
import DocumentEditDialog from '@/pages/speaking/SpeakingEdit.vue'

import { useToast } from '@/stores/toast.store'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const speakings = ref([])
const lessons = ref([])
const searchQuery = ref('')
const dialog = ref(false)
const editDialog = ref(false)
const detailDialog = ref(false)
const deleteDialog = ref(false)
const pivotDialog = ref(false)

const selectedLessonId = ref(null)
const selectedSpeakingId = ref(null)

const selectedDocument = ref(null)
const toast = useToast()
const isToolbarHidden = ref(false)
const showScrollToTop = ref(false)
const lastScrollPosition = ref(0)

const filteredspeakings = computed(() => {
  return speakings.value.filter((doc) => {
    const query = (searchQuery.value || '').toLowerCase()
    return (
      doc.content.toLowerCase().includes(query) ||
      (doc.description && doc.description.toLowerCase().includes(query))
    )
  })
})

const fetchspeakings = async () => {
  try {
    const response = await listSpeakingApi()
    speakings.value = response.data.data
  } catch (error) {
    console.error('Error fetching speakings:', error)
  }
}

const fetchLessons = async () => {
  try {
    const response = await listLessonApi()
    lessons.value = response.data.data
  } catch (error) {
    console.error('Error fetching lessons:', error)
  }
}

const openDocumentDetail = (doc) => {
  selectedDocument.value = doc
  detailDialog.value = true
}

const openDeleteConfirm = (doc) => {
  selectedDocument.value = doc
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await deleteSpeakingApi({ speaking_id: selectedDocument.value.id })
    speakings.value = speakings.value.filter((doc) => doc.id !== selectedDocument.value.id)
    deleteDialog.value = false
    selectedDocument.value = null
    toast.show('Xóa tài liệu thành công!', 'success')
  } catch (error) {
    console.error('Error deleting document:', error)
  }
}

const editDocument = (doc) => {
  selectedDocument.value = doc
  editDialog.value = true
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
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const confirmAddPivot = async () => {
  if (!selectedLessonId.value || !selectedSpeakingId.value) {
    toast.show('Vui lòng chọn Lesson và Speaking!', 'error')
    return
  }
  try {
    await addSpeakingPivot({
      lesson_id: selectedLessonId.value,
      speaking_id: selectedSpeakingId.value
    })
    pivotDialog.value = false
    toast.show('Thêm speaking pivot thành công!', 'success')
  } catch (error) {
    console.error('Error adding speaking pivot:', error)
    toast.show('Thêm speaking pivot thất bại!', 'error')
  }
}

onMounted(() => {
  fetchspeakings()
  fetchLessons()
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

.v-card.document-card {
  margin-bottom: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.v-card.document-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.btn-add-document {
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
  .btn-add-document {
    .v-btn {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
