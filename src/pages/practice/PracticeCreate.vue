<template>
    <v-dialog
        :model-value="dialog"
        @update:model-value="emit('update:dialog', $event)"
        max-width="900px"
        persistent
        scrollable
    >
        <v-card>
            <v-card-title class="text-h5 font-weight-bold">
                Thêm bài kiểm tra mới
            </v-card-title>

            <v-card-text>
                <v-form ref="formRef" @submit.prevent="submit">
                    <v-text-field
                        v-model="form.title"
                        label="Tiêu đề"
                        variant="outlined"
                        density="compact"
                        required
                        class="mb-4"
                        :rules="[v => !!v || 'Tiêu đề là bắt buộc']"
                    />

                    <v-textarea
                        v-model="form.description"
                        label="Mô tả"
                        variant="outlined"
                        density="compact"
                        auto-grow
                        rows="3"
                        class="mb-4"
                    />

                    <!-- Thời gian và ngày hết hạn trên cùng một dòng -->
                    <v-row class="mb-4">
                        <v-col cols="12" sm="4">
                            <v-select
                                v-model="form.grade_id"
                                :items="gradeOptions"
                                item-title="text"
                                item-value="value"
                                label="Khối"
                                variant="outlined"
                                density="compact"
                                :rules="[v => v !== null || 'Bắt buộc chọn khối']"
                            ></v-select>
                        </v-col>
                        <v-col cols="12" sm="4">
                            <v-select
                                v-model="form.limit_time"
                                :items="timeOptions"
                                item-title="text"
                                item-value="value"
                                label="Thời gian hết hạn"
                                variant="outlined"
                                density="compact"
                                :rules="[v => v !== null || 'Thời gian là bắt buộc']"
                            ></v-select>
                        </v-col>
                        <v-col cols="12" sm="4">
                            <v-text-field
                                v-model="form.due_date"
                                label="Ngày hết hạn"
                                variant="outlined"
                                density="compact"
                                type="datetime-local"
                                :rules="[v => !!v || 'Vui lòng chọn ngày hết hạn']"
                            ></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- Select Unit và Lesson với chức năng tìm kiếm -->
                    <v-row class="mb-2">
                        <v-col cols="12" sm="6">
                            <v-autocomplete
                                v-model="selectedUnit"
                                :items="listUnit"
                                item-title="title"
                                item-value="id"
                                label="Tìm kiếm và chọn Unit"
                                variant="outlined"
                                density="compact"
                                clearable
                                @update:modelValue="onUnitChange"
                                :loading="isLoadingUnits"
                                :search-input.sync="unitSearch"
                            ></v-autocomplete>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-autocomplete
                                v-model="selectedLesson"
                                :items="listLesson"
                                item-title="title"
                                item-value="id"
                                label="Tìm kiếm và chọn Lesson"
                                variant="outlined"
                                density="compact"
                                clearable
                                :disabled="!selectedUnit"
                                @update:modelValue="onLessonChange"
                                :loading="isLoadingLessons"
                                :search-input.sync="lessonSearch"
                            ></v-autocomplete>
                        </v-col>
                    </v-row>

                    <!-- Danh sách Activity với scroll -->
                    <v-row v-if="selectedLesson">
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="h-100">
                                <v-card-title class="text-subtitle-1 bg-blue-lighten-5">
                                    Danh sách Activity
                                </v-card-title>
                                <v-card-text class="pa-0">
                                    <v-list density="compact" class="activity-list" style="max-height: 300px; overflow-y: auto;">
                                        <v-list-item
                                            v-for="activity in listActivity"
                                            :key="activity.id"
                                            @click="toggleActivitySelection(activity)"
                                            :class="{ 'bg-blue-lighten-4': isActivitySelected(activity.id) }"
                                        >
                                            <template v-slot:prepend>
                                                <v-checkbox
                                                    :model-value="isActivitySelected(activity.id)"
                                                    @click.stop="toggleActivitySelection(activity)"
                                                    hide-details
                                                    class="mt-0"
                                                ></v-checkbox>
                                            </template>
                                            <v-list-item-title>{{ activity.title }}</v-list-item-title>
                                            <v-list-item-subtitle>{{ activity.description }}</v-list-item-subtitle>
                                        </v-list-item>
                                        <v-list-item v-if="listActivity.length === 0">
                                            <v-list-item-title class="text-grey">Không có activity nào</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-card-text>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-card variant="outlined" class="h-100">
                                <v-card-title class="text-subtitle-1 bg-green-lighten-5">
                                    Activities đã chọn ({{ form.activities.length }})
                                </v-card-title>
                                <v-card-text class="pa-0">
                                    <v-list density="compact" class="selected-activity-list" style="max-height: 300px; overflow-y: auto;">
                                        <v-list-item
                                            v-for="activity in form.activities"
                                            :key="activity.id"
                                        >
                                            <v-list-item-title>{{ activity.title }}</v-list-item-title>
                                            <template v-slot:append>
                                                <v-btn
                                                    size="x-small"
                                                    variant="text"
                                                    @click="removeActivity(activity.id)"
                                                >
                                                    <i class="fa-solid fa-trash-can"></i>
                                                </v-btn>
                                            </template>
                                        </v-list-item>
                                        <v-list-item v-if="form.activities.length === 0">
                                            <v-list-item-title class="text-grey">Chưa có activity nào được chọn</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>

            <v-card-actions>
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
                    Tạo mới
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script setup>
import { listActivityByIdUnitApi } from '@/apis/modules/activity.api';
import { listLessonByIdUnitApi } from '@/apis/modules/lesson.api';
import { createPracticeApi } from '@/apis/modules/practice.api';
import { listUnitApi } from '@/apis/modules/unit.api';

import { useToast } from '@/stores/toast.store';
import { defineEmits, defineProps, onMounted, ref, watch } from 'vue';

const props = defineProps({
  dialog: Boolean
});

const emit = defineEmits(['update:dialog', 'created']);

// Đặt ngày mặc định là hôm nay 23:59
const today = new Date();
today.setHours(23, 59, 0, 0);
const defaultDueDate = today.toISOString().slice(0, 16);

const form = ref({
  title: '',
  description: '',
  limit_time: 60,
  grade_id: null,
  due_date: defaultDueDate,
  activities: []
});

const timeOptions = ref([
  { text: '15 phút', value: 15 },
  { text: '20 phút', value: 20 },
  { text: '30 phút', value: 30 },
  { text: '45 phút', value: 45 },
  { text: '60 phút', value: 60 },
  { text: '75 phút', value: 75 },
  { text: '90 phút', value: 90 },
  { text: '105 phút', value: 105 },
  { text: '120 phút', value: 120 }
]);

const gradeOptions = ref([
  { text: 'Khối 1', value: 1 },
  { text: 'Khối 2', value: 2 },
  { text: 'Khối 3', value: 3 },
  { text: 'Khối 4', value: 4 },
  { text: 'Khối 5', value: 5 },
  { text: 'Khối 6', value: 6 },
  { text: 'Khối 7', value: 7 },
  { text: 'Khối 8', value: 8 },
  { text: 'Khối 9', value: 9 },
  { text: 'Khối 10', value: 10 },
  { text: 'Khối 11', value: 11 },
  { text: 'Khối 12', value: 12 }
]);

const toast = useToast();
const formRef = ref(null);
const isSubmitting = ref(false);

const listUnit = ref([]);
const listLesson = ref([]);
const listActivity = ref([]);
const selectedUnit = ref(null);
const selectedLesson = ref(null);
const isLoadingUnits = ref(false);
const isLoadingLessons = ref(false);
const isLoadingActivities = ref(false);
const unitSearch = ref('');
const lessonSearch = ref('');

onMounted(async () => {
  await fetchUnits();
});

const fetchUnits = async () => {
  try {
    isLoadingUnits.value = true;
    const response = await listUnitApi();
    listUnit.value = response.data.data;
  } catch (error) {
    console.error('Error fetching units:', error);
    toast.show('Có lỗi xảy ra khi tải danh sách unit!', 'error');
  } finally {
    isLoadingUnits.value = false;
  }
};

const onUnitChange = async (unitId) => {
  if (!unitId) {
    listLesson.value = [];
    selectedLesson.value = null;
    listActivity.value = [];
    return;
  }

  try {
    isLoadingLessons.value = true;
    const response = await listLessonByIdUnitApi(unitId);
    listLesson.value = response.data.data;
    selectedLesson.value = null;
    listActivity.value = [];
  } catch (error) {
    console.error('Error fetching lessons:', error);
    toast.show('Có lỗi xảy ra khi tải danh sách lesson!', 'error');
  } finally {
    isLoadingLessons.value = false;
  }
};

const onLessonChange = async (lessonId) => {
  if (!lessonId || !selectedUnit.value) {
    listActivity.value = [];
    return;
  }

  try {
    isLoadingActivities.value = true;
    const response = await listActivityByIdUnitApi(lessonId);
    listActivity.value = response.data.data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    toast.show('Có lỗi xảy ra khi tải danh sách activity!', 'error');
  } finally {
    isLoadingActivities.value = false;
  }
};

const toggleActivitySelection = (activity) => {
  const index = form.value.activities.findIndex(a => a.id === activity.id);

  if (index === -1) {
    form.value.activities.push(activity);
  } else {
    form.value.activities.splice(index, 1);
  }
};

const removeActivity = (activityId) => {
  const index = form.value.activities.findIndex(a => a.id === activityId);
  if (index !== -1) {
    form.value.activities.splice(index, 1);
  }
};

const isActivitySelected = (activityId) => {
  return form.value.activities.some(a => a.id === activityId);
};

const close = () => {
  emit('update:dialog', false);
};

const submit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  if (form.value.activities.length === 0) {
    toast.show('Vui lòng chọn ít nhất một activity!', 'error');
    return;
  }

  try {
    isSubmitting.value = true;

    let dueDate = form.value.due_date;
    if (dueDate) {
      dueDate = dueDate.replace('T', ' ') + ':00';
    }

    const payload = {
      title: form.value.title,
      description: form.value.description,
      due_date: dueDate,
      limit_time: form.value.limit_time,
      grade_id: form.value.grade_id,
      activities: form.value.activities.map(a => a.id)
    };

    const response = await createPracticeApi(payload);
    emit('created', response.data);
    close();
    toast.show('Tạo bài kiểm tra thành công!', 'success');
  } catch (error) {
    console.error('Error creating test:', error);
    toast.show('Có lỗi xảy ra khi tạo bài kiểm tra!', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

watch(
  () => props.dialog,
  (val) => {
    if (!val) {
      const today = new Date();
      today.setHours(23, 59, 0, 0);
      const defaultDueDate = today.toISOString().slice(0, 16);

      form.value = {
        title: '',
        description: '',
        limit_time: 60,
        grade_id: null,
        due_date: defaultDueDate,
        activities: []
      };

      selectedUnit.value = null;
      selectedLesson.value = null;
      listLesson.value = [];
      listActivity.value = [];
    }
  }
);
</script>

<style scoped>
.v-card-title {
  background: linear-gradient(90deg, #1976d2, #42a5f5);
  color: white;
  padding: 16px;
}
.v-card-text {
  padding: 30px 16px;
}
.v-btn.btn-save {
  text-transform: none;
  font-weight: 500;
}
.h-100 {
  height: 100%;
}

/* Custom scrollbar for activity lists */
.activity-list::-webkit-scrollbar,
.selected-activity-list::-webkit-scrollbar {
  width: 6px;
}

.activity-list::-webkit-scrollbar-track,
.selected-activity-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.activity-list::-webkit-scrollbar-thumb,
.selected-activity-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb:hover,
.selected-activity-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
