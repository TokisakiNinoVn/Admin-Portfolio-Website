<template>
  <div class="practice-card">
    <!-- Ảnh -->
    <div class="card-image" @click="$emit('view', practice)">
      <img
        src="https://i.pinimg.com/736x/a3/a1/3e/a3a13e6d662e512ba2c8b77c9885f4e3.jpg"
        alt="Test cover"
      />
    </div>

    <!-- Nội dung -->
    <div class="card-content" @click="$emit('view', practice)">
      <h2 class="practice-title" :title="practice.title">
        {{ truncateTitle(practice.title) }}
      </h2>
      <p class="practice-description" :title="practice.description">
        {{ truncateDescription(practice.description) }}
      </p>

      <div class="practice-tags">
        <span class="tag blue" :title="`Thời gian làm: ${practice.limit_time} phút`">
          <i class="fa-solid fa-clock"></i> {{ practice.limit_time }} phút
        </span>
        <span class="tag purple" :title="`Hạn nộp: ${formatDate(practice.due_date)}`">
          <i class="fa-solid fa-calendar-day"></i> {{ formatDate(practice.due_date) }}
        </span>
      </div>

      <div
        class="practice-author"
        :title="`Đăng bởi: ${practice.upload_by === 'teacher' ? 'Giáo viên' : 'Hệ thống'}`"
      >
        Đăng bởi: {{ practice.upload_by === 'teacher' ? 'Giáo viên' : 'Hệ thống' }}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="card-actions">
      <button @click="$emit('view', practice)" title="Xem chi tiết">
        <i class="fa-solid fa-eye"></i>
      </button>
      <button @click="$emit('edit', practice)" title="Sửa bài kiểm tra">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button @click="$emit('delete', practice)" title="Xoá bài kiểm tra">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  practice: { type: Object, required: true },
})
const emit = defineEmits(['view', 'edit', 'delete'])

const truncateTitle = (text) => {
  const maxLength = 40
  return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text
}

const truncateDescription = (text) => {
  const maxLength = 70
  return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN')
}
</script>

<style scoped>
.practice-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background-color: #fff;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-image {
  width: 100%;
  height: 120px;
  overflow: hidden;
}
.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-content {
  padding: 16px 16px 0 16px;
  flex-grow: 1;
}

/* phần style còn lại giữ nguyên */
.practice-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 8px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.practice-description {
  font-size: 14px;
  color: #4b5563;
  min-height: 42px;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.practice-tags {
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
.tag.purple {
  background-color: #ede9fe;
  color: #6b21a8;
}
.practice-author {
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
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
