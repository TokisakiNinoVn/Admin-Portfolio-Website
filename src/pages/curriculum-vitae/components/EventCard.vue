<template>
  <v-card variant="outlined" class="event-card">
    <div class="event-card-header">
      <i class="fa-solid fa-grip-vertical event-drag-handle"></i>

      <v-btn
        icon
        size="x-small"
        variant="text"
        class="toggle-btn"
        @click="event.expanded = !event.expanded"
      >
        <i :class="['fa-solid', event.expanded ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
      </v-btn>

      <div class="flex-grow-1 min-w-0">
        <template v-if="event.expanded">
          <v-text-field
            v-model="event.label"
            placeholder="Tên sự kiện"
            variant="plain"
            density="compact"
            hide-details="auto"
            class="event-title-input"
            :rules="[v => !!v || 'Tên sự kiện là bắt buộc']"
          />
        </template>
        <template v-else>
          <div class="truncate text-body-2 font-weight-medium">
            {{ event.label || 'Sự kiện chưa đặt tên' }}
          </div>
          <div class="truncate text-caption text-grey">
            <span v-if="event.position">{{ event.position }}</span>
            <span v-if="event.position && (event.start_date || event.end_date)"> · </span>
            <span v-if="event.start_date || event.end_date">
              {{ event.start_date || '?' }} → {{ event.end_date || 'Hiện tại' }}
            </span>
          </div>
        </template>
      </div>

      <v-btn icon size="small" color="error" variant="text" @click="$emit('remove')">
        <i class="fa-solid fa-trash"></i>
      </v-btn>
    </div>

    <v-expand-transition>
      <div v-if="event.expanded" class="event-card-body">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <v-text-field
            v-model="event.position"
            label="Vị trí / Chức vụ"
            variant="outlined"
            density="compact"
            hide-details="auto"
            class="mb-2"
          />
          <v-text-field
            v-model="event.location"
            label="Địa điểm"
            variant="outlined"
            density="compact"
            hide-details="auto"
            class="mb-4"
          />
         <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="event.start_date"
              label="Ngày bắt đầu"
              variant="outlined"
              density="compact"
              type="date"
              hide-details="auto"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="event.end_date"
              label="Ngày kết thúc"
              variant="outlined"
              density="compact"
              type="date"
              hide-details="auto"
            />
          </v-col>
        </v-row>
        </div>

        <!-- <v-textarea
          v-model="event.content"
          label="Nội dung mô tả"
          variant="outlined"
          density="compact"
          auto-grow
          rows="2"
          class="mt-3"
          hide-details="auto"
        /> -->

        <RichTextEditor
          v-model="event.content"
          placeholder="Nội dung mô tả"
          class="mt-3"
        />

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <v-text-field
            v-model="event.demo_url"
            label="URL Demo"
            variant="outlined"
            density="compact"
            placeholder="https://..."
            hide-details="auto"
            class="mb-2"
          />
          <v-text-field
            v-model="event.github_url"
            label="URL Github"
            variant="outlined"
            density="compact"
            placeholder="https://..."
            hide-details="auto"
            class="mb-2"
          />
        </div>

        <v-select
          v-model="event.skills"
          :items="listSkill"
          item-title="name"
          item-value="id"
          label="Kỹ năng liên quan"
          variant="outlined"
          density="compact"
          multiple
          chips
          closable-chips
          class="mt-3"
          hide-details="auto"
        />
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import RichTextEditor from './RichTextEditor.vue';
defineProps({
  event: { type: Object, required: true },
  listSkill: { type: Array, default: () => [] },
});
defineEmits(['remove']);
</script>

<style scoped>
.event-card {
  background: #ffffff;
  border-left: 2px solid #42a5f5;
  border-radius: 8px;
}
.event-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
}
.event-card-body {
  padding: 0 12px 12px 12px;
  border-top: 1px dashed #e0e0e0;
  padding-top: 12px;
}
.event-title-input :deep(input) {
  font-weight: 500;
}
.event-drag-handle {
  cursor: grab;
  touch-action: none;
  color: #9e9e9e;
  flex-shrink: 0;
}
.event-drag-handle:active {
  cursor: grabbing;
}
</style>
