<template>
  <div class="skillCategories-card">

    <!-- Nội dung -->
    <div class="card-content" @click="$emit('view', skillCategories)">
      <h2 class="skillCategories-title" :title="skillCategories.label">{{ truncateTitle(skillCategories.label) }}</h2>
      <p class="skillCategories-description" :title="skillCategories.description">{{ truncateDescription(skillCategories.description) }}</p>
    </div>

    <!-- Action Buttons -->
    <div class="card-actions">
      <button @click="$emit('view', skillCategories)" title="Xem chi tiết" tooltip="Xem chi tiết">
        <i class="fa-solid fa-eye"></i>
      </button>
      <button @click="$emit('edit', skillCategories)" title="Sửa" tooltip="Sửa">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button @click="$emit('delete', skillCategories)" title="Xoá" tooltip="Xoá">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  skillCategories: { type: Object, required: true },
})

const emit = defineEmits(['view', 'edit', 'delete'])

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
.skillCategories-card {
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

.skillCategories-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 8px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.skillCategories-description {
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

.skillCategories-tags {
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

.skillCategories-author {
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
