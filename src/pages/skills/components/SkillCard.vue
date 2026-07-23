<template>
  <div class="skill-card">
    <!-- Nội dung -->
    <div class="card-content" @click="$emit('view', skill)">
      <h2 class="skill-title" :title="skill.name">{{ truncateTitle(skill.name) }}</h2>
      <p class="skill-description" :title="skill.description">
        {{ truncateDescription(skill.description) }}
      </p>

      <div class="skill-tags">
        <span class="tag blue" :title="`Ngày tạo: ${formatDate(skill.created_at)}`">
          <i class="fa-solid fa-calendar"></i> {{ formatDate(skill.created_at) }}
        </span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="card-actions">
      <button @click="$emit('view', skill)" title="Xem chi tiết">
        <i class="fa-solid fa-eye"></i>
      </button>
      <button @click="$emit('edit', skill)" title="Sửa tài liệu">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button @click="$emit('delete', skill)" title="Xoá tài liệu">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  skill: { type: Object, required: true },
})
const emit = defineEmits(['view', 'edit', 'delete'])

// format ngày
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN')
}

// hàm cắt tiêu đề
const truncateTitle = (text) => {
  const maxLength = 40
  return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text
}

// hàm cắt mô tả
const truncateDescription = (text) => {
  const maxLength = 70
  return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text
}
</script>

<style scoped>
.skill-card {
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

.card-content {
  padding: 16px 16px 0 16px;
  flex-grow: 1;
}

.skill-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 8px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.skill-description {
  font-size: 14px;
  color: #4b5563;
  min-height: 42px;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.skill-tags {
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

.skill-author {
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-link {
  color: #2563eb;
  text-decoration: none;
}
.file-link:hover {
  text-decoration: underline;
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
