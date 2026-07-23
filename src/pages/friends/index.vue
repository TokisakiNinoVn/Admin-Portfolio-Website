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

            <!-- Nút thêm bạn bè mới -->
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
                Thêm bạn bè
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Lesson Cards Grid -->
    <v-col
      v-for="(item, index) in filteredLessons"
      :key="item.id"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <v-card elevation="2" class="d-flex flex-column h-100 friends-card">
        <FriendCard
          :friends="item"
          @view="openFriendDetail"
          @edit="editFriend"
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
  <FriendCreateDialog v-model:dialog="dialog" @created="fetchFriend" />
  <!-- Dialog chỉnh sửa bài học -->
  <FriendEditDialog
    v-model:dialog="editDialog"
    :friends="selectedFriend"
    @updated="fetchFriend"
  />

  <FriendDetail
    v-model:dialog="detailDialog"
    :friends="selectedFriend"
  />

  <!-- Dialog xem chi tiết -->
  <v-dialog v-model="detailDialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h5 title-detail-unit">{{ selectedFriend?.title }}</v-card-title>
      <v-card-text>
        <p><strong>Mô tả:</strong> {{ selectedFriend?.description }}</p>
        <p><strong>Đăng bởi:</strong> {{ selectedFriend?.upload_by === 'teacher' ? 'Giáo viên' : 'Hệ thống' }}</p>
        <p><strong>Ngày tạo:</strong> {{ new Date(selectedFriend?.created_at).toLocaleDateString() }}</p>
        <p><strong>Ngày cập nhật:</strong> {{ new Date(selectedFriend?.updated_at).toLocaleDateString() }}</p>
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
        Bạn có chắc chắn muốn xóa bài học "{{ selectedFriend?.title }}"?
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
import FriendCreateDialog from '@/pages/friends/FriendCreate.vue'
import FriendDetail from '@/pages/friends/FriendDetail.vue'
import FriendEditDialog from '@/pages/friends/FriendEdit.vue'
import FriendCard from '@/pages/friends/components/FriendCard.vue'
import FriendService from '@/services/friends.service'
import { useToast } from '@/stores/toast.store'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const friends = ref([])
const searchQuery = ref('')
const selectedType = ref(null)
const selectedLevel = ref(null)
const dialog = ref(false)
const editDialog = ref(false)
const detailDialog = ref(false)
const deleteDialog = ref(false)
const selectedFriend = ref(null)
const toast = useToast()
const showScrollToTop = ref(false)
const lastScrollPosition = ref(0)

const filteredLessons = computed(() => {
  return friends.value.filter((friends) => {
    const query = (searchQuery.value || '').toLowerCase()
    const matchesSearch =
      friends.name.toLowerCase().includes(query)
    return matchesSearch
  })
})


const viewListActivity = (friends) => {
  selectedLessonForActivities.value = friends
  activityListVisible.value = true
}


const fetchFriend = async () => {
  try {
    const response = await FriendService.list()
    friends.value = response
  } catch (error) {
    console.error('Error fetching friends:', error)
  }
}

const openFriendDetail = (friends) => {
  window.open(friends.personal_website, '_blank')
}

const openDeleteConfirm = (friends) => {
  // Tạo bản sao để tránh tham chiếu
  selectedFriend.value = { ...friends }
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await FriendService.delete(selectedFriend.value.id)
    friends.value = friends.value.filter((friends) => friends.id !== selectedFriend.value.id)
    deleteDialog.value = false
    // Reset sau khi xóa
    setTimeout(() => {
      selectedFriend.value = null
    }, 300)
    toast.show('Thao tác thành công!', 'success')
  } catch (error) {
    console.error('Error deleting friends:', error)
    toast.show('Thao tác thất bại!', 'error')
  }
}

const editFriend = (friends) => {
  selectedFriend.value = { ...friends }
  editDialog.value = true
}

// Reset selectedFriend khi các dialog đóng
watch([editDialog, detailDialog, deleteDialog], ([edit, detail, del]) => {
  if (!edit && !detail && !del) {
    setTimeout(() => {
      selectedFriend.value = null
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
  fetchFriend()
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
