<template>
  <div class="lesson-card">
    <!-- Cover Container -->
    <div class="cover-container">
      <img
        class="cover-image"
        :src="coverUrl"
        :alt="lesson.title"
      />
      <span v-if="lesson.is_new" class="new-badge">Mới</span>
    </div>

    <!-- Nội dung -->
    <div class="card-content" @click="$emit('view', lesson)">
      <h2 class="lesson-title" :title="lesson.title">{{ truncateTitle(lesson.title) }}</h2>
      <p class="lesson-description" :title="lesson.description">{{ truncateDescription(lesson.description) }}</p>
      <div class="lesson-author" :title="`Đăng bởi: ${lesson.upload_by === 'teacher' ? 'Giáo viên' : 'Hệ thống'}`">
        Đăng bởi: {{ lesson.upload_by === 'teacher' ? 'Giáo viên' : 'Hệ thống' }}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="card-actions">
      <button @click="$emit('view', lesson)" title="Xem chi tiết" tooltip="Xem chi tiết">
        <i class="fa-solid fa-eye"></i>
      </button>
      <button @click="$emit('edit', lesson)" title="Sửa bài học" tooltip="Sửa bài học">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button @click="$emit('viewListActivity', lesson)" title="Danh sách các hoạt động" tooltip="Các hoạt động">
        <i class="fa-solid fa-chart-line"></i>
      </button>
      <button @click="$emit('delete', lesson)" title="Xoá bài học" tooltip="Xoá bài học">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  lesson: { type: Object, required: true },
})

const levels = [
  { title: 'Dễ', value: 'normal' },
  { title: 'Trung bình', value: 'medium' },
  { title: 'Khó', value: 'hard' }
]
const types = [
  { title: 'Cuộc hội thoại', value: 'conversation'},
  { title: 'Từ vựng', value: 'vocabulary' },
  { title: 'Ngữ pháp', value: 'grammar' },
]
const emit = defineEmits(['view', 'edit', 'delete'])

const coverUrl = computed(() => {
  return 'https://i.pinimg.com/736x/d7/f1/5a/d7f15a31e2e076bc50fcc6e7db787f81.jpg'
})
// Hàm lấy tiêu đề cấp độ
const getLevelTitle = (value) => {
  const level = levels.find(l => l.value === value)
  return level ? level.title : value
}

// Hàm lấy tiêu đề loại
const getTypeTitle = (value) => {
  const type = types.find(t => t.value === value)
  return type ? type.title : value
}

// Hàm cắt ngắn tiêu đề (1 dòng)
const truncateTitle = (text) => {
  const maxLength = 40 // Điều chỉnh độ dài tối đa tùy theo thiết kế
  if (text.length > maxLength) {
    return text.substring(0, maxLength - 3) + '...'
  }
  return text
}

// Hàm cắt ngắn mô tả (2 dòng)
const truncateDescription = (text) => {
  const maxLength = 70 // Điều chỉnh độ dài tối đa tùy theo thiết kế
  if (text.length > maxLength) {
    return text.substring(0, maxLength - 3) + '...'
  }
  return text
}
</script>

<style scoped>
.lesson-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background-color: #fff;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.cover-container {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.new-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #d1fae5;
  color: #047857;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 9999px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.card-content {
  padding: 16px 16px 0 16px;
  flex-grow: 1;
}

.lesson-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 8px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lesson-description {
  font-size: 14px;
  color: #4b5563;
  min-height: 42px;
  margin-bottom: 12px;
  display: -webkit-box;
  /* -webkit-line-clamp: 2; */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lesson-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 12px;
  justify-content: space-evenly;
}

.tag {
  font-size: 13px;
  padding: 3px 6px;
  border-radius: 999px;
  font-weight: 500;
  background-color: #f3f4f6;
  color: #374151;
}

.tag.blue {
  background-color: #dbeafe;
  color: #1e40af;
}

.tag.red {
  background-color: #fee2e2;
  color: #b91c1c;
}

.tag.purple {
  background-color: #ede9fe;
  color: #6b21a8;
}

.lesson-author {
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Action buttons */
.card-actions {
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  border-top: 1px solid #eee;
}

.card-actions button {
  background: none;
  border: none;
  cursor: pointer;
  color: #555;
  font-size: 16px;
  transition: color 0.2s;
}

.card-actions button:hover {
  color: #1d4ed8;
}
</style>
