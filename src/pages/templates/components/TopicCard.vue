<template>
  <div class="topic-card">
    <div class="card-content" @click="$emit('view', topic)">
      <!-- Header -->
      <div class="topic-header">
        <div class="topic-icon">
          <i class="fa-solid fa-layer-group"></i>
        </div>

        <div class="topic-info">
          <h2 class="topic-title" :title="topic.name">
            {{ topic.name }}
          </h2>

          <p class="topic-description" :title="topic.description">
            {{ topic.description || 'Không có mô tả' }}
          </p>
        </div>
      </div>

      <!-- Stats -->
      <div class="topic-stats">
        <div class="stat-item blue">
          <i class="fa-solid fa-book"></i>
          <div>
            <span class="stat-value">
              {{ topic.question_banks_count || 0 }}
            </span>
            <span class="stat-label">
              Số lượng câu hỏi
            </span>
          </div>
        </div>

        <!-- <div class="stat-item green">
          <i class="fa-regular fa-clock"></i>
          <div>
            <span class="stat-value">
              {{ formatDateTime(topic.created_at) }}
            </span>
            <span class="stat-label">
              Ngày tạo
            </span>
          </div>
        </div> -->
      </div>
    </div>

    <!-- Actions -->
    <div class="card-actions">
      <button
        class="action-btn view"
        @click="$emit('view', topic)"
        title="Xem chi tiết"
      >
        <i class="fa-solid fa-eye"></i>
      </button>

      <button
        class="action-btn edit"
        @click="$emit('edit', topic)"
        title="Chỉnh sửa"
      >
        <i class="fa-solid fa-pen-to-square"></i>
      </button>

      <button
        class="action-btn delete"
        @click="$emit('delete', topic)"
        title="Xóa"
      >
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, defineProps } from 'vue';

defineProps({
  topic: {
    type: Object,
    required: true,
  },
})

defineEmits(['view', 'edit', 'delete'])
</script>

<style scoped>
.topic-card {
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

.topic-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.1);
}

.card-content {
  padding: 18px;
  flex: 1;
  cursor: pointer;
}

/* Header */
.topic-header {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.topic-icon {
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

.topic-info {
  flex: 1;
  min-width: 0;
}

.topic-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topic-description {
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
.topic-stats {
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
