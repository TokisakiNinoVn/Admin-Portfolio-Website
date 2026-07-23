<template>
  <div class="paper-card">
    <div class="card-content" @click="$emit('view-questions', paper)">
      <!-- Header -->
      <div class="paper-header">
        <div class="paper-info">
          <h2 class="paper-title" :title="paper.title">
            {{ paper.title }}
          </h2>

          <p class="paper-description" :title="paper.instruction">
            {{ paper.instruction || 'Không có hướng dẫn' }}
          </p>
        </div>
      </div>

    </div>

    <!-- Actions -->
    <div class="card-actions">
      <button
        class="action-btn view"
        @click="$emit('view-questions', paper)"
        title="Xem câu hỏi trong đề thi"
      >
        <i class="fa-solid fa-question"></i>
      </button>

      <button
        class="action-btn view"
        @click="$emit('view', paper)"
        title="Xem chi tiết đề thi"
      >
        <i class="fa-solid fa-eye"></i>
      </button>

      <button
        class="action-btn view"
        @click="$emit('view-submissions', paper)"
        title="Danh sách các bài nộp của đề thi"
      >
        <i class="fa-solid fa-table"></i>
      </button>

      <button
        class="action-btn edit"
        @click="$emit('edit', paper)"
        title="Chỉnh sửa đề thi"
      >
        <i class="fa-solid fa-pen-to-square"></i>
      </button>

      <button
        class="action-btn delete"
        @click="$emit('delete', paper)"
        title="Xóa đề thi"
      >
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, defineProps } from 'vue';

defineProps({
  paper: {
    type: Object,
    required: true,
  },
})

defineEmits(['view', 'edit', 'delete', 'view-questions'])
</script>

<style scoped>
.paper-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #eef2f7;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

.paper-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.1);
}

.card-content {
  padding: 18px;
  flex: 1;
  cursor: pointer;
}

/* Header */
.paper-header {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.paper-icon {
  min-width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.25);
}

.paper-info {
  flex: 1;
  min-width: 0;
}

.paper-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.paper-description {
  margin-top: 6px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  min-height: 44px;
}

/* Stats */
.paper-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 12px;
  border-radius: 14px;
}

.stat-item i {
  font-size: 18px;
}

.stat-item div {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 14px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

/* Colors */
.stat-item.blue {
  background: #eff6ff;
  color: #1d4ed8;
}

.stat-item.green {
  background: #ecfdf5;
  color: #047857;
}

/* Actions */
.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 12px 16px;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
}

.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: white;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 15px;

  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.action-btn:hover {
  transform: translateY(-2px);
}

.action-btn.view {
  color: #2563eb;
}

.action-btn.view:hover {
  background: #eff6ff;
}

.action-btn.edit {
  color: #d97706;
}

.action-btn.edit:hover {
  background: #fffbeb;
}

.action-btn.delete {
  color: #dc2626;
}

.action-btn.delete:hover {
  background: #fef2f2;
}
</style>
