<template>
  <div class="friends-card">

    <!-- Nội dung -->
    <div class="card-content" @click="$emit('view', friends)">
      <h2 class="friends-title" :title="friends.name">{{ friends.name }}</h2>
      <p class="friends-description" :title="friends.link">{{ friends.link }}</p>
      <img :src="friends.avatar_link" alt="Friends" class="image-friend" />
    </div>

    <!-- Action Buttons -->
    <div class="card-actions">
      <button @click="$emit('view', friends)" title="Xem trang bạn bè" tooltip="Xem trang bạn bè">
        <i class="fa-solid fa-eye"></i>
      </button>
      <button @click="$emit('edit', friends)" title="Sửa" tooltip="Sửa">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button @click="$emit('delete', friends)" title="Xoá" tooltip="Xoá">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  friends: { type: Object, required: true },
})

const emit = defineEmits(['view', 'edit', 'delete'])
</script>

<style scoped>
.friends-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background-color: #fff;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.cover-container {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
}

.image-friend {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
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
