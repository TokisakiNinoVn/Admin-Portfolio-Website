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
                label="Tìm kiếm sách"
                variant="outlined"
                clearable
                hide-details
              />
            </v-col>
            <!-- <v-col cols="12" sm="6" md="3">
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

            <!-- Nút thêm sách -->
            <v-col cols="12" sm="6" md="3" class="d-flex justify-end align-center btn-add-book">
              <v-btn color="primary" variant="outlined" @click="dialog = true">
                <i class="fa-solid fa-plus mr-2"></i>
                Thêm sách mới
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Book Cards Grid -->
    <v-col
      v-for="(item, index) in filteredBooks"
      :key="item.id"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <v-card elevation="2" class="d-flex flex-column h-100 book-card">
        <BookCard
          :book="item"
          @view="openBookDetail"
          @edit="editBook"
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

  <!-- Dialog tạo sách -->
  <BookCreateDialog v-model:dialog="dialog" @created="fetchBooks" />
  <!-- Dialog chỉnh sửa sách -->
  <BookEditDialog
    v-model:dialog="editDialog"
    :book="selectedBook"
    @updated="fetchBooks"
  />

  <BookDetail
    v-model:dialog="detailDialog"
    :book="selectedBook"
    :types="types"
  />

  <!-- Dialog xem chi tiết -->
  <v-dialog v-model="detailDialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h5">{{ selectedBook?.title }} kk</v-card-title>
      <v-card-text>
        <v-img
          :src="formatURLImage(selectedBook?.cover)"
          :alt="selectedBook?.title"
          height="200"
          class="mb-4"
        />
        <p><strong>Mô tả:</strong> {{ selectedBook?.description }}</p>
        <p><strong>Thời gian:</strong> {{ selectedBook?.limit_time }} phút</p>
        <p><strong>Độ khó:</strong> {{ selectedBook?.level }}</p>
        <p><strong>Đăng bởi:</strong> {{ selectedBook?.upload_by === 'teacher' ? 'Giáo viên' : 'Hệ thống' }}</p>
        <p><strong>Ngày tạo:</strong> {{ new Date(selectedBook?.created_at).toLocaleDateString() }}</p>
        <p><strong>Ngày cập nhật:</strong> {{ new Date(selectedBook?.updated_at).toLocaleDateString() }}</p>
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
        Bạn có chắc chắn muốn xóa sách "{{ selectedBook?.title }}"?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="deleteDialog = false">Hủy</v-btn>
        <v-btn color="error" variant="text" @click="confirmDelete">Xóa</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Component Danh sách bài học (BÊN PHẢI) -->
  <LessonListPanel
    v-model:show="lessonListVisible"
    :book="selectedBook"
    :lessons="demoListLessonOfBook"
    @add-lesson="addLessonToBook"
    @remove-lesson="removeLessonFromBook"
  />
</template>
<script setup>
// import { deleteBookApi, listBookApi } from '@/apis/modules/book.api'
import { listLessonApi } from '@/apis/modules/lesson.api'
import BookCreateDialog from '@/pages/book/BookCreate.vue'
import BookDetail from '@/pages/book/BookDetail.vue'
import BookEditDialog from '@/pages/book/BookEdit.vue'
import BookCard from '@/pages/book/components/BookCard.vue'
import LessonListPanel from '@/pages/book/LessonListPanel.vue'
import { useToast } from '@/stores/toast.store'
import { formatURLImage } from '@/utils/format.util'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const units = ref([])
const lessons = ref([])
const searchQuery = ref('')
const selectedType = ref(null)
const selectedLevel = ref(null)
const dialog = ref(false)
const editDialog = ref(false)
const detailDialog = ref(false)
const deleteDialog = ref(false)
const lessonListVisible = ref(false)
const selectedBook = ref(null)
const toast = useToast()
const isToolbarHidden = ref(false)
const showScrollToTop = ref(false)
const lastScrollPosition = ref(0)

const filteredBooks = computed(() => {
  return units.value.filter((book) => {
    const query = (searchQuery.value || '').toLowerCase()
    const matchesSearch =
      book.title.toLowerCase().includes(query) ||
      (book.description && book.description.toLowerCase().includes(query))
    const matchesType = !selectedType.value || book.type === selectedType.value
    const matchesLevel = !selectedLevel.value || book.level === selectedLevel.value
    return matchesSearch && matchesType && matchesLevel
  })
})

const fetchBooks = async () => {
  try {
    const response = await listBookApi()
    units.value = response.data.data.map((book) => ({
      ...book,
      category: book.type,
    }))
  } catch (error) {
    console.error('Error fetching units:', error)
  }
}

const fetchLessons = async () => {
  try {
    const response = await listLessonApi()
    lessons.value = response.data.data.map((lesson) => ({
      ...lesson,
      category: lesson.type,
    }))
  } catch (error) {
    console.error('Error fetching lessons:', error)
  }
}

const openBookDetail = (book) => {
  // Tạo bản sao để tránh tham chiếu
  selectedBook.value = { ...book }
  detailDialog.value = true
}

const openLessonList = (book) => {
  // Tạo bản sao để tránh tham chiếu
  // console.error("open book:", book.id)
  selectedBook.value = { ...book }
  lessonListVisible.value = true
}

const openDeleteConfirm = (book) => {
  // Tạo bản sao để tránh tham chiếu
  selectedBook.value = { ...book }
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await deleteBookApi({ unit_id: selectedBook.value.id })
    units.value = units.value.filter((book) => book.id !== selectedBook.value.id)
    deleteDialog.value = false
    // Reset sau khi xóa
    setTimeout(() => {
      selectedBook.value = null
    }, 300)
    toast.show('Xóa sách thành công!', 'success')
  } catch (error) {
    console.error('Error deleting book:', error)
  }
}

const editBook = (book) => {
  console.log('Editing book:', book)
  // Tạo bản sao để tránh tham chiếu
  selectedBook.value = { ...book }
  editDialog.value = true
}

// Thêm bài học vào sách
const addLessonToBook = (lesson) => {
  if (!demoListLessonOfBook.value.some(l => l.id === lesson.id)) {
    demoListLessonOfBook.value.push(lesson)
    toast.show(`Đã thêm "${lesson.title}" vào sách`, 'success')
  } else {
    toast.show('Bài học đã có trong sách', 'warning')
  }
}

// Xóa bài học khỏi sách
const removeLessonFromBook = (lessonId) => {
  const lessonIndex = demoListLessonOfBook.value.findIndex(l => l.id === lessonId)
  if (lessonIndex !== -1) {
    const removedLesson = demoListLessonOfBook.value[lessonIndex]
    demoListLessonOfBook.value.splice(lessonIndex, 1)
    toast.show(`Đã xóa "${removedLesson.title}" khỏi sách`, 'success')
  }
}

// Reset selectedBook khi các dialog đóng
watch([editDialog, detailDialog, deleteDialog, lessonListVisible], ([edit, detail, del, lessonList]) => {
  if (!edit && !detail && !del && !lessonList) {
    setTimeout(() => {
      selectedBook.value = null
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
  fetchBooks()
  // fetchLessons()
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

.book-card {
  transition: all 0.3s ease;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}



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

.v-card.book-card {
  margin-bottom: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.v-card.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.btn-add-book {
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
  .btn-add-book {
    .v-btn {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
