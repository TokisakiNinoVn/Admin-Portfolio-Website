<template>
  <v-row class="mt-2">
    <!-- Toolbar Sticky -->
    <v-col cols="12" class="toolbar-sticky z-index-10" :class="{ 'toolbar-hidden': isToolbarHidden }">
      <v-card class="mb-2" elevation="2">
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="searchQuery"
                label="Tìm kiếm kỹ năng..."
                variant="outlined"
                clearable
                hide-details
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-select
                v-model="selectedCategory"
                :items="categoriesSkills"
                item-title="label"
                item-value="id"
                label="Danh mục kỹ năng"
                variant="outlined"
                clearable
                hide-details
                density="compact"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4" class="d-flex justify-end align-center btn-add-skill">
              <v-btn color="primary" variant="outlined" @click="dialog = true">
                <i class="fa-solid fa-plus mr-2"></i>
                Thêm Kỹ năng mới
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Bảng kỹ năng -->
    <v-col cols="12">
      <v-data-table
        :headers="headers"
        :items="filteredSkills"
        :loading="loading"
        class="elevation-1 skill-table"
        item-value="id"
        :items-per-page="10"
        :search="''"
        density="comfortable"
        hover
      >
        <!-- Cột Tên kỹ năng với chip màu -->
        <template v-slot:item.name="{ item }">
          <v-chip
            :style="{
              backgroundColor: item.background_color || '#1976D2',
              color: item.text_color || '#FFFFFF'
            }"
            size="small"
            label
          >
            {{ item.name }}
          </v-chip>
        </template>

        <!-- Cột Danh mục -->
        <template v-slot:item.categories_skill_id="{ item }">
          <span>{{ getCategoryLabel(item.categories_skill_id) }}</span>
        </template>

        <!-- Cột Mô tả (cắt ngắn nếu dài) -->
        <template v-slot:item.description="{ item }">
          <span class="text-truncate" style="max-width: 200px; display: inline-block;">
            {{ item.description || '—' }}
          </span>
        </template>

        <!-- Cột Thao tác -->
        <template v-slot:item.actions="{ item }">
          <v-icon size="small" class="mr-2" @click="openSkillDetail(item)" color="primary">
            <i class="fa-solid fa-eye"></i>
          </v-icon>
          <v-icon size="small" class="mr-2" @click="editSkill(item)" color="warning">
            <i class="fa-solid fa-pen-to-square"></i>
          </v-icon>
          <v-icon size="small" @click="openDeleteConfirm(item)" color="error">
            <i class="fa-solid fa-trash"></i>
          </v-icon>
        </template>

        <!-- Trạng thái không có dữ liệu -->
        <template v-slot:no-data>
          <div class="text-center pa-4">
            <p class="text-body-1">Không có kỹ năng nào phù hợp.</p>
          </div>
        </template>
      </v-data-table>
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
  <SkillCreateDialog v-model:dialog="dialog" @created="fetchSkills" />
  <!-- Dialog chỉnh sửa tài liệu -->
  <SkillEditDialog
    v-model:dialog="editDialog"
    :skill="selectedSkill"
    @updated="fetchSkills"
  />

  <SkillDetail
    v-model:dialog="detailDialog"
    :skill="selectedSkill"
  />
  <!-- Dialog xác nhận xóa -->
  <v-dialog v-model="deleteDialog" max-width="400px">
    <v-card>
      <v-card-title class="text-h6">Xác nhận xóa</v-card-title>
      <v-card-text>
        Bạn có chắc chắn muốn xóa kỹ năng "{{ selectedSkill?.name }}"?
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
import SkillCreateDialog from '@/pages/skills/SkillCreate.vue'
import SkillDetail from '@/pages/skills/SkillDetail.vue'
import SkillEditDialog from '@/pages/skills/SkillEdit.vue'
import CategoriesSkillsService from '@/services/categories-skills.service'
import SkillsService from '@/services/skills.service'
import { useToast } from '@/stores/toast.store'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const skills = ref([])
const categoriesSkills = ref([])
const searchQuery = ref('')
const selectedCategory = ref(null)
const dialog = ref(false)
const editDialog = ref(false)
const detailDialog = ref(false)
const deleteDialog = ref(false)
const selectedSkill = ref(null)
const toast = useToast()
const isToolbarHidden = ref(false)
const showScrollToTop = ref(false)
const lastScrollPosition = ref(0)
const loading = ref(false)

// Định nghĩa các cột cho bảng
const headers = [
  { title: 'Tên kỹ năng', key: 'name', sortable: true, align: 'start' },
  { title: 'Danh mục', key: 'categories_skill_id', sortable: true, align: 'start' },
  { title: 'Mô tả', key: 'description', sortable: false, align: 'start' },
  { title: 'Thao tác', key: 'actions', sortable: false, align: 'center' },
]

// Lọc dữ liệu theo từ khóa và danh mục
const filteredSkills = computed(() => {
  return skills.value.filter((skill) => {
    const query = (searchQuery.value || '').toLowerCase().trim()
    const matchesSearch =
      skill.name.toLowerCase().includes(query) ||
      (skill.description && skill.description.toLowerCase().includes(query))
    const matchesCategory =
      !selectedCategory.value || skill.categories_skill_id === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

// Lấy tên danh mục từ id
const getCategoryLabel = (categoryId) => {
  const category = categoriesSkills.value.find((c) => c.id === categoryId)
  return category ? category.label : '—'
}

const fetchSkills = async () => {
  loading.value = true
  try {
    const response = await SkillsService.list()
    skills.value = response
  } catch (error) {
    console.error('Error fetching skills:', error)
  } finally {
    loading.value = false
  }
}

const fetchCategoriesSkills = async () => {
  try {
    const response = await CategoriesSkillsService.list()
    categoriesSkills.value = response
  } catch (error) {
    console.error('Error fetching categories skills:', error)
  }
}

const openSkillDetail = (doc) => {
  selectedSkill.value = { ...doc }
  detailDialog.value = true
}

const openDeleteConfirm = (doc) => {
  selectedSkill.value = { ...doc }
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await SkillsService.delete(selectedSkill.value.id)
    skills.value = skills.value.filter((doc) => doc.id !== selectedSkill.value.id)
    deleteDialog.value = false
    setTimeout(() => {
      selectedSkill.value = null
    }, 300)
    toast.show('Xóa kỹ năng thành công!', 'success')
  } catch (error) {
    console.error('Error deleting skill:', error)
  }
}

const editSkill = (doc) => {
  selectedSkill.value = { ...doc }
  editDialog.value = true
}

// Reset selectedSkill khi các dialog đóng
watch([editDialog, detailDialog, deleteDialog], ([edit, detail, del]) => {
  if (!edit && !detail && !del) {
    setTimeout(() => {
      selectedSkill.value = null
    }, 300)
  }
})

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

onMounted(() => {
  fetchSkills()
  fetchCategoriesSkills()
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

.btn-add-skill {
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

/* Tùy chỉnh giao diện bảng */
.skill-table {
  border-radius: 8px;
  overflow: hidden;
}

/* Đảm bảo chip hiển thị đẹp */
.v-chip {
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* Responsive: ẩn cột mô tả trên màn hình nhỏ */
@media screen and (max-width: 768px) {
  .skill-table :deep(th:nth-child(3)),
  .skill-table :deep(td:nth-child(3)) {
    display: none;
  }
}

@media screen and (max-width: 1024px) {
  .btn-add-skill {
    .v-btn {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
