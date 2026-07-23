<template>
  <v-dialog
    :model-value="dialog"
    @update:model-value="emit('update:dialog', $event)"
    max-width="1100px"
    persistent
    scrollable
  >
    <v-card class="cv-dialog-card">
      <v-card-title class="cv-dialog-header">
        <div class="flex items-center gap-3">
          <i class="fa-solid fa-file-circle-plus text-xl"></i>
          <span class="text-h5 font-weight-bold">Thêm CV mới</span>
        </div>
        <v-btn icon variant="text" class="text-white" @click="close">
          <i class="fa-solid fa-xmark"></i>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-form ref="formRef" @submit.prevent="submit">
          <div class="flex flex-col lg:flex-row gap-6">
            <!-- ============ CỘT TRÁI: Thông tin cá nhân ============ -->
            <div class="w-full lg:w-[36%] flex flex-col gap-5">
              <!-- Avatar upload vuông -->
              <div class="flex flex-col items-center">
                <input
                  ref="avatarInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onAvatarFileChange"
                />
                <div
                  class="avatar-dropzone group"
                  @click="avatarInputRef?.click()"
                >
                  <v-img
                    v-if="form.avatar.url"
                    :src="form.avatar.url"
                    cover
                    class="w-full h-full"
                  />
                  <div v-else class="avatar-placeholder">
                    <i class="fa-solid fa-user text-3xl mb-1"></i>
                    <span class="text-xs">Ảnh đại diện</span>
                  </div>

                  <!-- overlay hover -->
                  <div class="avatar-overlay">
                    <i class="fa-solid fa-camera text-lg mb-1"></i>
                    <span class="text-xs font-medium">{{ form.avatar.url ? 'Đổi ảnh' : 'Tải ảnh lên' }}</span>
                  </div>

                  <!-- loading -->
                  <div v-if="uploadingAvatar" class="avatar-loading">
                    <i class="fa-solid fa-spinner fa-spin text-xl"></i>
                  </div>
                </div>
                <span class="text-xs text-gray-500 mt-2">PNG, JPG tối đa 5MB</span>
              </div>

              <v-text-field
                v-model="form.label"
                label="Tiêu đề CV"
                variant="outlined"
                density="comfortable"
                :rules="[v => !!v || 'Tiêu đề là bắt buộc']"
                required
                hide-details="auto"
              />

              <v-select
                v-model="form.template"
                :items="TEMPLATE_OPTIONS"
                item-value="value"
                item-title="label"
                label="Template"
                variant="outlined"
                density="comfortable"
                :rules="[v => !!v || 'Vui lòng chọn template']"
                required
                hide-details="auto"
              />

              <v-divider />

              <div class="grid grid-cols-1 gap-4">
                <v-text-field
                  v-model="form.title"
                  label="Chức danh"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-text-field
                  v-model="form.phone"
                  label="Số điện thoại"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <v-text-field
                  v-model="form.email"
                  label="Email"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !v || /.+@.+\..+/.test(v) || 'Email không hợp lệ']"
                  hide-details="auto"
                />
                <v-text-field
                  v-model="form.address"
                  label="Địa chỉ"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
                <div class="grid grid-cols-2 gap-4">
                  <v-select
                    v-model="form.gender"
                    :items="['Nam', 'Nữ', 'Khác']"
                    label="Giới tính"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                  <v-text-field
                    v-model="form.birthday"
                    label="Ngày sinh"
                    variant="outlined"
                    density="comfortable"
                    type="date"
                    hide-details="auto"
                  />
                </div>
              </div>

              <v-divider />

              <!-- Mạng xã hội -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-subtitle-1 font-weight-bold">
                    <i class="fa-solid fa-share-nodes mr-2 text-blue-500"></i>
                    Liên kết mạng xã hội
                  </span>
                  <v-btn color="primary" variant="text" size="small" @click="addSocialLink">
                    <i class="fa-solid fa-plus mr-1"></i> Thêm
                  </v-btn>
                </div>

                <div
                  v-for="(link, index) in form.social_links"
                  :key="index"
                  class="flex items-center gap-2 mb-2"
                >
                  <v-text-field
                    v-model="link.name"
                    label="Nền tảng"
                    variant="outlined"
                    density="compact"
                    placeholder="VD: Facebook"
                    hide-details="auto"
                  />
                  <v-text-field
                    v-model="link.link"
                    label="Đường dẫn"
                    variant="outlined"
                    density="compact"
                    placeholder="https://..."
                    hide-details="auto"
                  />
                  <v-btn
                    icon
                    size="small"
                    color="error"
                    variant="text"
                    @click="removeSocialLink(index)"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </v-btn>
                </div>
              </div>
            </div>

            <v-divider vertical class="d-none d-lg-flex" />

            <!-- ============ CỘT PHẢI: Các nhóm & sự kiện ============ -->
            <div class="w-full lg:w-[64%] flex flex-col gap-3">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <span class="text-h6 font-weight-bold">
                  <i class="fa-solid fa-layer-group mr-2 text-blue-500"></i>
                  Các nhóm (Kinh nghiệm, Học vấn, ...)
                </span>
                <div class="flex items-center gap-2">
                  <v-btn
                    variant="tonal"
                    size="small"
                    color="grey-darken-1"
                    @click="toggleAllGroups"
                  >
                    <i :class="['fa-solid mr-1', allGroupsExpanded ? 'fa-compress' : 'fa-expand']"></i>
                    {{ allGroupsExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả' }}
                  </v-btn>
                  <v-btn color="primary" variant="flat" size="small" @click="addGroup">
                    <i class="fa-solid fa-plus mr-1"></i> Thêm nhóm
                  </v-btn>
                </div>
              </div>

              <draggable
                v-model="form.groups_event"
                item-key="id"
                handle=".drag-handle"
                group="groups"
                class="groups-container flex flex-col gap-3"
              >
                <template #item="{ element: group, index: groupIndex }">
                  <v-card variant="outlined" class="group-card">
                    <!-- header nhóm -->
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
                        v-model="group.label"
                        placeholder="Tên nhóm (VD: Kinh nghiệm làm việc)"
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

                      <v-btn icon size="small" color="error" variant="text" @click="removeGroup(groupIndex)">
                        <i class="fa-solid fa-trash"></i>
                      </v-btn>
                    </div>

                    <v-expand-transition>
                      <div v-if="group.expanded" class="group-card-body">
                        <div class="flex flex-col sm:flex-row gap-3 mb-3">
                          <v-select
                            v-model="group.type_group"
                            :items="TYPE_GROUP_OPTIONS"
                            item-value="value"
                            item-title="label"
                            label="Loại nhóm"
                            variant="outlined"
                            density="compact"
                            hide-details="auto"
                            class="sm:max-w-[220px]"
                          />
                          <v-textarea
                            v-model="group.description"
                            label="Mô tả nhóm"
                            variant="outlined"
                            density="compact"
                            auto-grow
                            rows="1"
                            hide-details="auto"
                          />
                        </div>

                        <!-- Sự kiện -->
                        <div class="events-section">
                          <div class="flex items-center justify-between mb-2">
                            <span class="text-subtitle-2 font-weight-medium text-grey-darken-1">
                              <i class="fa-solid fa-clock-rotate-left mr-1"></i> Sự kiện
                            </span>
                            <v-btn color="primary" variant="text" size="small" @click="addEvent(groupIndex)">
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

                                  <v-btn
                                    icon
                                    size="small"
                                    color="error"
                                    variant="text"
                                    @click="removeEvent(groupIndex, eventIndex)"
                                  >
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
                                      />
                                      <v-text-field
                                        v-model="event.location"
                                        label="Địa điểm"
                                        variant="outlined"
                                        density="compact"
                                        hide-details="auto"
                                      />
                                      <v-text-field
                                        v-model="event.start_date"
                                        label="Ngày bắt đầu"
                                        variant="outlined"
                                        density="compact"
                                        type="date"
                                        hide-details="auto"
                                      />
                                      <v-text-field
                                        v-model="event.end_date"
                                        label="Ngày kết thúc"
                                        variant="outlined"
                                        density="compact"
                                        type="date"
                                        hide-details="auto"
                                      />
                                    </div>

                                    <v-textarea
                                      v-model="event.content"
                                      label="Nội dung mô tả"
                                      variant="outlined"
                                      density="compact"
                                      auto-grow
                                      rows="2"
                                      class="mt-3"
                                      hide-details="auto"
                                    />

                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                      <v-text-field
                                        v-model="event.demo_url"
                                        label="URL Demo"
                                        variant="outlined"
                                        density="compact"
                                        placeholder="https://..."
                                        hide-details="auto"
                                      />
                                      <v-text-field
                                        v-model="event.github_url"
                                        label="URL Github"
                                        variant="outlined"
                                        density="compact"
                                        placeholder="https://..."
                                        hide-details="auto"
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
              </draggable>

              <div v-if="!form.groups_event.length" class="empty-events">
                <i class="fa-regular fa-folder-open mr-2"></i>
                Chưa có nhóm nào, bấm "Thêm nhóm" để bắt đầu
              </div>
            </div>
          </div>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="grey" variant="text" @click="close">Hủy</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="isSubmitting"
          @click="submit"
          class="btn-save"
        >
          <i class="fa-solid fa-check mr-2"></i>
          Lưu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import CurriculumVitaeService from '@/services/curriculum-vitae.service';
import FileService from '@/services/file.service';
import SkillsService from '@/services/skills.service';
import { useToast } from '@/stores/toast.store';
import { computed, onMounted, ref, watch } from 'vue';
import draggable from 'vuedraggable';

const props = defineProps({
  dialog: Boolean,
});
const emit = defineEmits(['update:dialog', 'created']);

const TEMPLATE_OPTIONS = [
  { label: 'Template 1', value: 'template-1' },
  { label: 'Template 2', value: 'template-2' },
  { label: 'Template 3', value: 'template-3' },
];

const TYPE_GROUP_OPTIONS = [
  { label: 'Công việc', value: 'WORK' },
  { label: 'Học vấn', value: 'EDUCATION' },
  { label: 'Chứng chỉ', value: 'CERTIFICATE' },
  { label: 'Hoạt động', value: 'EVENT' },
];

const TYPE_GROUP_COLORS = {
  WORK: 'blue',
  EDUCATION: 'teal',
  CERTIFICATE: 'amber-darken-2',
  EVENT: 'purple',
};

const typeLabel = (value) =>
  TYPE_GROUP_OPTIONS.find((t) => t.value === value)?.label || value;
const typeColor = (value) => TYPE_GROUP_COLORS[value] || 'grey';

const toast = useToast();
const formRef = ref(null);
const isSubmitting = ref(false);
const uploadingAvatar = ref(false);
const avatarInputRef = ref(null);
const listSkill = ref([]);

let idCounter = 0;
const genId = () => `id-${Date.now()}-${idCounter++}`;

const emptyEvent = () => ({
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

const emptyGroup = () => ({
  id: genId(),
  expanded: true,
  label: '',
  description: '',
  type_group: 'WORK',
  events: [emptyEvent()],
});

const emptyForm = () => ({
  template: '',
  avatar: { url: '', file: null },
  label: '',
  title: '',
  phone: '',
  email: '',
  address: '',
  gender: '',
  birthday: '',
  social_links: [{ name: '', link: '' }],
  groups_event: [emptyGroup()],
});

const form = ref(emptyForm());

// Mở rộng / thu gọn tất cả các nhóm
const allGroupsExpanded = computed(
  () => form.value.groups_event.length > 0 && form.value.groups_event.every((g) => g.expanded)
);
const toggleAllGroups = () => {
  const next = !allGroupsExpanded.value;
  form.value.groups_event.forEach((g) => {
    g.expanded = next;
  });
};

// Avatar
const onAvatarFileChange = async (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  await handleAvatarUpload(file);
};

const handleAvatarUpload = async (file) => {
  if (!file) {
    form.value.avatar.url = '';
    form.value.avatar.file = null;
    return;
  }

  try {
    uploadingAvatar.value = true;
    await FileService.upload('avatars', file);
    const { publicUrl } = await FileService.publicUrl('avatars', file);
    form.value.avatar.url = publicUrl;
    form.value.avatar.file = file;
    toast.show('Tải ảnh lên thành công', 'success');
  } catch (error) {
    console.error('Upload avatar error:', error);
    toast.show('Lỗi khi tải ảnh lên', 'error');
  } finally {
    uploadingAvatar.value = false;
  }
};

// Social links
const addSocialLink = () => {
  form.value.social_links.push({ name: '', link: '' });
};
const removeSocialLink = (index) => {
  form.value.social_links.splice(index, 1);
};

// Groups
const addGroup = () => {
  form.value.groups_event.push(emptyGroup());
};
const removeGroup = (index) => {
  form.value.groups_event.splice(index, 1);
};

// Events
const addEvent = (groupIndex) => {
  form.value.groups_event[groupIndex].events.push(emptyEvent());
};
const removeEvent = (groupIndex, eventIndex) => {
  form.value.groups_event[groupIndex].events.splice(eventIndex, 1);
};

// Skills
const fetchSkills = async () => {
  try {
    const response = await SkillsService.list();
    listSkill.value = response;
  } catch (error) {
    console.error('Error fetching skills:', error);
    toast.show('Lỗi khi tải danh sách kỹ năng', 'error');
  }
};

// Submit
const submit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  try {
    isSubmitting.value = true;

    const payload = {
      ...form.value,
      avatar: form.value.avatar.url,
      groups_event: form.value.groups_event.map(({ id, expanded, events, ...group }) => ({
        ...group,
        events: events.map(({ id: eId, expanded: eExpanded, ...event }) => event),
      })),
    };

    const response = await CurriculumVitaeService.create(payload);
    emit('created', response);
    close();
    toast.show('Tạo CV thành công!', 'success');
  } catch (error) {
    console.error('Error creating CV:', error);
    toast.show('Có lỗi xảy ra khi tạo CV!', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const close = () => {
  emit('update:dialog', false);
};

// Reset form khi đóng dialog
watch(
  () => props.dialog,
  (val) => {
    if (!val) {
      form.value = emptyForm();
    }
  }
);

onMounted(() => {
  fetchSkills();
});
</script>

<style scoped>
.cv-dialog-card {
  border-radius: 16px;
  overflow: hidden;
}

.cv-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: linear-gradient(90deg, #1565c0, #42a5f5);
  color: white;
}

/* ---------- Avatar ---------- */
.avatar-dropzone {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 18px;
  border: 2px dashed #90caf9;
  background: #f3f8ff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.avatar-dropzone:hover {
  border-color: #1976d2;
  background: #eaf3fd;
}
.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #64b5f6;
}
.avatar-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: opacity 0.2s ease;
}
.avatar-dropzone:hover .avatar-overlay {
  opacity: 1;
}
.avatar-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
  color: #1976d2;
}

/* ---------- Groups ---------- */
.groups-container {
  min-height: 50px;
}
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

.toggle-btn {
  flex-shrink: 0;
}

/* ---------- Events ---------- */
.events-container {
  min-height: 20px;
}
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

/* ---------- Drag handles ---------- */
.drag-handle,
.event-drag-handle {
  cursor: grab;
  touch-action: none;
  color: #9e9e9e;
  flex-shrink: 0;
}
.drag-handle:active,
.event-drag-handle:active {
  cursor: grabbing;
}

.btn-save {
  text-transform: none;
  font-weight: 500;
}
</style>
