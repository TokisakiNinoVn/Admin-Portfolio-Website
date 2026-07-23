<template>
  <v-card variant="outlined" class="group-card mb-2">
    <div class="group-card-header">
      <i class="fa-solid fa-grip-vertical drag-handle"></i>

      <v-btn
        icon
        size="x-small"
        variant="text"
        class="toggle-btn"
        @click="group.expanded = !group.expanded"
      >
        <i :class="['fa-solid', group.expanded ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
      </v-btn>

      <v-text-field
        :model-value="group.label"
        @update:model-value="group.label = $event?.toUpperCase()"
        placeholder="Tên nhóm (VD: KINH NGHIỆM LÀM VIỆC)"
        variant="plain"
        density="compact"
        class="flex-grow-1 group-title-input"
        hide-details="auto"
        :rules="[v => !!v || 'Tên nhóm là bắt buộc']"
      />

      <v-chip size="small" :color="typeColor(group.type_group)" variant="flat" class="mr-1">
        {{ typeLabel(group.type_group) }}
      </v-chip>
      <v-chip size="small" variant="outlined" class="mr-1">
        <i class="fa-solid fa-list mr-1"></i>{{ group.events.length }}
      </v-chip>

      <v-btn icon size="small" color="error" variant="text" @click="$emit('remove')">
        <i class="fa-solid fa-trash"></i>
      </v-btn>
    </div>

    <v-expand-transition>
      <div v-if="group.expanded" class="group-card-body">
        <div class="flex flex-col sm:flex-row gap-3 mb-3">
          <v-select
            v-model="group.type_group"
            :items="typeGroupOptions"
            item-value="value"
            item-title="label"
            label="Loại nhóm"
            variant="outlined"
            density="compact"
            hide-details="auto"
            class="sm:max-w-[220px] flex-shrink-0 mb-2"
          />
          
          <div v-if="!['SKILL'].includes(group.type_group)" class="flex-grow-1 min-w-0">
            <label class="field-label">Mô tả nhóm</label>

            <RichTextEditor
              v-if="!['EVENT'].includes(group.type_group)"
              v-model="group.description"
              placeholder="Mô tả chi tiết cho nhóm này..."
            />
            <v-textarea
              v-else-if="['WORK'].includes(group.type_group)"
              v-model="group.description"
              variant="outlined"
              density="compact"
              auto-grow
              rows="1"
              hide-details="auto"
              placeholder="Mô tả nhóm"
            />
          </div>

          <div v-else class="w-100">
            <div class="mb-4">
              <div class="text-subtitle-2 mb-2">
                Danh mục kỹ năng
              </div>

              <div
                v-for="category in listSkillCategory"
                :key="category.id"
                class="mb-2"
              >
                <v-checkbox
                  :model-value="isCategorySelected(category.id)"
                  :label="category.label"
                  density="compact"
                  hide-details
                  @update:model-value="toggleCategory(category.id, $event)"
                />

                <v-expand-transition>
                  <div
                    v-if="group.skills_by_category?.[category.id]"
                    class="ml-6 mt-1"
                  >
                    <v-select
                      :model-value="group.skills_by_category[category.id]"
                      @update:model-value="setCategorySkills(category.id, $event)"
                      :items="skillsByCategory[category.id] || []"
                      item-title="label"
                      item-value="id"
                      return-object
                      multiple
                      chips
                      closable-chips
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      label="Chọn kỹ năng"
                      class="skill-select"
                    />
                  </div>
                </v-expand-transition>
              </div>
            </div>
          </div>
        </div>

        <!-- Sự kiện -->
        <div 
          v-if="['EVENT'].includes(group.type_group)"
          class="events-section"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-subtitle-2 font-weight-medium text-grey-darken-1">
              <i class="fa-solid fa-clock-rotate-left mr-1"></i> Sự kiện
            </span>
            <v-btn color="primary" variant="text" size="small" @click="addEvent">
              <i class="fa-solid fa-plus mr-1"></i> Thêm sự kiện
            </v-btn>
          </div>

          <draggable
            v-model="group.events"
            item-key="id"
            handle=".event-drag-handle"
            group="events"
            class="events-container flex flex-col gap-2"
          >
            <template #item="{ element: event, index: eventIndex }">
              <EventCard
                :event="event"
                :list-skill="listSkill"
                @remove="removeEvent(eventIndex)"
              />
            </template>
          </draggable>

          <div v-if="!group.events.length" class="empty-events">
            <i class="fa-regular fa-folder-open mr-2"></i>
            Chưa có sự kiện nào trong nhóm này
          </div>
        </div>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import SkillsService from '@/services/skills.service';
import { ref } from 'vue';
import draggable from 'vuedraggable';
import EventCard from './EventCard.vue';
import RichTextEditor from './RichTextEditor.vue';

const props = defineProps({
  group: { type: Object, required: true },
  typeGroupOptions: { type: Array, required: true },
  listSkill: { type: Array, default: () => [] },
  listSkillCategory: { type: Array, default: () => [] },
});
defineEmits(['remove']);

const TYPE_GROUP_COLORS = {
  WORK: '#000000',
  EDUCATION: '#000000',
  CERTIFICATE: '#000000',
  EVENT: '#000000',
};
const typeLabel = (value) =>
  props.typeGroupOptions.find((t) => t.value === value)?.label || value;
const typeColor = (value) => TYPE_GROUP_COLORS[value] || '#000000';

let idCounter = 0;
const genId = () => `evt-${Date.now()}-${idCounter++}-${Math.random().toString(36).slice(2, 6)}`;

const addEvent = () => {
  props.group.events.push({
    id: genId(),
    expanded: true,
    label: '',
    position: '',
    content: '',
    location: '',
    start_date: '',
    end_date: '',
    skills: [],
    demo_url: '',
    github_url: '',
  });
};

const skillsByCategory = ref({});

const fetchSkillsByCategory = async (categoryId) => {
  try {
    const response = await SkillsService.listSkillByCategory(categoryId);
    skillsByCategory.value[categoryId] = response ?? [];
  } catch (error) {
    console.error('Error fetching skills:', error);
    toast.show('Lỗi khi tải danh sách kỹ năng', 'error');
  }
};

const isCategorySelected = (categoryId) => {
  return categoryId in (props.group.skills_by_category || {});
};

const toggleCategory = (categoryId, checked) => {
  if (!props.group.skills_by_category) {
    props.group.skills_by_category = {};
  }

  if (checked) {
    if (!props.group.skills_by_category[categoryId]) {
      props.group.skills_by_category[categoryId] = [];

      fetchSkillsByCategory(categoryId);
    }
  } else {
    delete props.group.skills_by_category[categoryId];
  }
};

const setCategorySkills = (categoryId, skills) => {
  // skills là mảng object { id, name, ... } nhờ return-object trên v-select
  props.group.skills_by_category[categoryId] = skills;
};

const removeEvent = (eventIndex) => {
  props.group.events.splice(eventIndex, 1);
};
</script>

<style scoped>
.group-card {
  border-left: 4px solid #1976d2;
  background: #fafcff;
  border-radius: 10px;
  overflow: hidden;
}
.group-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f0f6ff;
}
.group-card-body {
  padding: 14px;
  background: #ffffff;
  border-top: 1px solid #e3eefc;
}
.group-title-input :deep(input) {
  font-weight: 600;
  font-size: 0.95rem;
}
.field-label {
  display: block;
  font-size: 0.75rem;
  color: #757575;
  margin-bottom: 4px;
}
.toggle-btn {
  flex-shrink: 0;
}
.drag-handle {
  cursor: grab;
  touch-action: none;
  color: #9e9e9e;
  flex-shrink: 0;
}
.drag-handle:active {
  cursor: grabbing;
}
.events-container {
  min-height: 20px;
}
.empty-events {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #9e9e9e;
  font-size: 0.875rem;
  border: 1px dashed #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

.skill-select :deep(.v-field__input) {
  padding: 10px !important;
}
</style>
