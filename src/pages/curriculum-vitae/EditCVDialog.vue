<template>
  <v-dialog
    :model-value="dialog"
    @update:model-value="emit('update:dialog', $event)"
    max-width="1200px"
    persistent
    scrollable
  >
    <v-card class="cv-dialog-card">
      <v-card-title class="cv-dialog-header">
        <div class="flex items-center gap-3">
          <i class="fa-solid fa-user text-xl"></i>
          <span class="text-h5 font-weight-bold ml-4 text-white">Chỉnh sửa CV</span>
        </div>
        <v-btn icon variant="text" class="text-white" @click="close">
          <i class="fa-solid fa-xmark text-white"></i>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-0">
        <v-form ref="formRef" @submit.prevent="submit" class="cv-form">
          <div class="cv-columns">
            <!-- ============ CỘT TRÁI: Thông tin cơ bản ============ -->
            <aside class="cv-col-left">
              <BasicInfoSection
                :form="form"
                :template-options="TEMPLATE_OPTIONS"
                :uploading-avatar="uploadingAvatar"
                @upload-avatar="handleAvatarUpload"
                @remove-avatar="handleRemoveAvatar"
              />
            </aside>

            <v-divider vertical class="cv-col-divider d-none d-lg-flex" />

            <!-- ============ CỘT PHẢI: Các nhóm & sự kiện ============ -->
            <section
              class="cv-col-right"
            >
              <div class="cv-right-header">
                <span class="text-h6 font-weight-bold">
                  <i class="fa-solid fa-layer-group mr-2 text-blue-500"></i>
                  Các nhóm (Kinh nghiệm, Học vấn, ...)
                </span>
                <div class="flex items-center gap-2">
                  <v-btn variant="tonal" size="small" color="grey-darken-1" @click="toggleAllGroups" class="mr-3">
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
                  <GroupCard
                    :group="group"
                    :type-group-options="TYPE_GROUP_OPTIONS"
                    :list-skill="listSkill"
                    :list-skill-category="listSkillCategory"
                    @remove="removeGroup(groupIndex)"
                  />
                </template>
              </draggable>

              <div v-if="!form.groups_event.length" class="empty-events">
                <i class="fa-regular fa-folder-open mr-2"></i>
                Chưa có nhóm nào, bấm "Thêm nhóm" để bắt đầu
              </div>
            </section>
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
import SkillCategoriesService from '@/services/categories-skills.service';
import CurriculumVitaeService from '@/services/curriculum-vitae.service';
import FileService from '@/services/file.service';
import SkillsService from '@/services/skills.service';
import { useToast } from '@/stores/toast.store';
import { computed, onMounted, ref, watch } from 'vue';
import draggable from 'vuedraggable';
import BasicInfoSection from './components/BasicInfoSection.vue';
import GroupCard from './components/GroupCard.vue';

const props = defineProps({
  dialog: Boolean,
  curriculumVitae: Object,
});
const emit = defineEmits(['update:dialog', 'updated']);

const TEMPLATE_OPTIONS = [
  { label: 'Template 1', value: 'template-1' },
  { label: 'Template 2', value: 'template-2' },
  { label: 'Template 3', value: 'template-3' },
];

const TYPE_GROUP_OPTIONS = [
  { label: 'Công việc', value: 'WORK' }, // Description -> TextArea
  { label: 'Học vấn', value: 'EDUCATION' }, // Description -> TextArea
  { label: 'Chứng chỉ', value: 'CERTIFICATE' }, // Description -> TextArea
  { label: 'Hoạt động', value: 'EVENT' }, // Description -> TextArea
  { label: 'Kỹ năng', value: 'SKILL' }, // Description ->TextArea
];

const toast = useToast();
const formRef = ref(null);
const isSubmitting = ref(false);
const uploadingAvatar = ref(false);
const listSkill = ref([]);
const listSkillCategory = ref([]);

let idCounter = 0;
const genId = (prefix) =>
  `${prefix}-${Date.now()}-${idCounter++}-${Math.random().toString(36).slice(2, 6)}`;

const emptyEvent = () => ({
  id: genId('evt'),
  expanded: true,
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
  id: genId('grp'),
  expanded: true,
  label: '',
  description: '',
  type_group: 'WORK',
  events: [emptyEvent()],
});

const emptyForm = () => ({
  template: '',
  full_name: '',
  avatar: { url: '', file: null },
  title: '',
  phone: '',
  email: '',
  address: '',
  gender: '',
  birthday: '',
  social_links: [
    { name: '', link: '' },
  ],
  groups_event: [emptyGroup()],
  skills_category: [],
  skills_by_category: {},
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
const handleAvatarUpload = async (file) => {
  if (!file) {
    form.value.avatar.url = '';
    form.value.avatar.path = '';
    form.value.avatar.file = null;
    return;
  }

  try {
    uploadingAvatar.value = true;

    const uploadResult = await FileService.upload(
      'images',
      file
    );

    const publicUrl = await FileService.publicUrl(
      'images',
      uploadResult.path
    );

    form.value.avatar.url = publicUrl;
    form.value.avatar.path = uploadResult.path;
    form.value.avatar.file = file;

    toast.show('Tải ảnh lên thành công', 'success');
  } catch (error) {
    console.error('Upload avatar error:', error);
    toast.show('Lỗi khi tải ảnh lên', 'error');
  } finally {
    uploadingAvatar.value = false;
  }
};

const handleRemoveAvatar = async () => {
  try {
    uploadingAvatar.value = true;

    if (form.value.avatar.path) {
      await FileService.delete(
        'images',
        form.value.avatar.path
      );
    }

    form.value.avatar.url = '';
    form.value.avatar.path = '';
    form.value.avatar.file = null;

    toast.show('Xóa ảnh thành công', 'success');
  } catch (error) {
    console.error('Delete avatar error:', error);
    toast.show('Lỗi khi xóa ảnh', 'error');
  } finally {
    uploadingAvatar.value = false;
  }
};
// Groups
const addGroup = () => {
  form.value.groups_event.push(emptyGroup());
};
const removeGroup = (index) => {
  form.value.groups_event.splice(index, 1);
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

const fetchSkillCategory = async () => {
  try {
    const response = await SkillCategoriesService.list();
    listSkillCategory.value = response;
  } catch (error) {
    console.error('Error fetching skill category:', error);
    toast.show('Lỗi khi tải danh sách danh mục kỹ năng', 'error');
  }
};

// Submit
const submit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  try {
    isSubmitting.value = true;

    // const dataPayload = {
    //   ...form.value,
    //   avatar: form.value.avatar.url,
    //   groups_event: form.value.groups_event.map(({ id, expanded, events, ...group }) => ({
    //     ...group,
    //     events: events.map(({ id: eId, expanded: eExpanded, ...event }) => event),
    //   })),
    // };

    // delete dataPayload.skills_by_category;
    // delete dataPayload.skills_category;

    const dataPayload = {
      ...form.value,
      avatar: form.value.avatar.url,
      groups_event: form.value.groups_event.map(
        ({ id, expanded, events, ...group }) => ({
          ...group,
          events:
            group.type_group === 'EVENT'
              ? []
              : events.map(({ id: eId, expanded: eExpanded, ...event }) => event),
        })
      ),
    };

    delete dataPayload.skills_by_category;
    delete dataPayload.skills_category;

    // console.log(JSON.stringify(dataPayload));

    const response = await CurriculumVitaeService.update(props.curriculumVitae.id, dataPayload);
    emit('updated', response);
    close();
    toast.show('Cập nhật CV thành công!', 'success');
  } catch (error) {
    console.error('Error updating CV:', error);
    toast.show('Có lỗi xảy ra khi cập nhật CV!', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const close = () => {
  emit('update:dialog', false);
};

// Helper: map groups_event từ API (thêm id, expanded cho group & events)
const mapGroupsFromApi = (groups) => {
  if (!Array.isArray(groups)) return [];
  return groups.map((group) => ({
    ...group,
    id: group.id ?? genId('grp'),
    expanded: group.expanded ?? true,
    events: Array.isArray(group.events)
      ? group.events.map((evt) => ({
          ...evt,
          id: evt.id ?? genId('evt'),
          expanded: evt.expanded ?? true,
        }))
      : [emptyEvent()],
  }));
};

// Khi dialog mở (hoặc props.dialog thay đổi), fetch và điền dữ liệu
watch(
  () => props.dialog,
  async (val) => {
    if (!val) {
      form.value = emptyForm();
      return;
    }

    // Reset form cơ bản
    form.value = emptyForm();

    if (props.curriculumVitae && props.curriculumVitae.id) {
      try {
        isSubmitting.value = true;
        // get() trả về mảng, lấy phần tử đầu tiên
        const result = await CurriculumVitaeService.get(props.curriculumVitae.id);
        const cv = Array.isArray(result) ? result[0] : result;
        if (!cv) {
          toast.show('Không tìm thấy dữ liệu CV', 'error');
          return;
        }
        form.value = {
          ...emptyForm(),
          ...cv,
          avatar: {
            url: cv.avatar || '',
            path: cv.avatar || '',
            file: null,
          },
          groups_event: mapGroupsFromApi(cv.groups_event),
        };
      } catch (error) {
        console.error('Error fetching CV:', error);
        toast.show('Lỗi khi tải dữ liệu CV', 'error');
      } finally {
        isSubmitting.value = false;
      }
    }
  }
);

onMounted(() => {
  fetchSkills();
  fetchSkillCategory();
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

.cv-form {
  padding: 24px;
}

.cv-columns {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
@media (min-width: 1024px) {
  .cv-columns {
    flex-direction: row;
    align-items: flex-start;
  }
}

.cv-col-left {
  width: 100%;
}
.cv-col-right {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
@media (min-width: 1024px) {
  .cv-col-left {
    width: 40%;
    flex-shrink: 0;
    position: sticky;
    top: 0;
  }
  .cv-col-right {
    width: 66%;
  }
}
.cv-col-divider {
  align-self: stretch;
}

.cv-right-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.groups-container {
  min-height: 50px;
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

.btn-save {
  text-transform: none;
  font-weight: 500;
}
</style>
