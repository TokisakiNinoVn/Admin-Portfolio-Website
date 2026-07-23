<template>
    <v-dialog :model-value="dialog" @update:model-value="emit('update:dialog', $event)" max-width="600px" persistent>
        <v-card>
            <v-card-title class="text-h5 font-weight-bold">Thêm bài học mới</v-card-title>
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
                        v-model="form.content"
                        label="Mô tả"
                        variant="outlined"
                        density="compact"
                        auto-grow
                        rows="3"
                        class="mb-4"
                    />
                    
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
                    Lưu
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { listClassApi } from '@/apis/modules/class.api';
import { createNotificationApi } from '@/apis/modules/notification.api';
import { listStudentApi } from '@/apis/modules/student.api';

import { useToast } from '@/stores/toast.store';
import { defineEmits, defineProps, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
    dialog: Boolean
});
const emit = defineEmits(['update:dialog', 'created']);
const form = ref({
    title: '',
    content: '',
    status: 1,
});

const toast = useToast();
const formRef = ref();
const isSubmitting = ref(false);
const previewImageUrl = ref('');
const listClass = ref([]);
const listStudent = ref([]);

const close = () => {
    emit('update:dialog', false);
};

const submit = async () => {
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    try {
        isSubmitting.value = true;
        const request = {
            title: form.value.title,
            content: form.value.content,
            status: form.value.status,
        };

        const response = await createNotificationApi(request);
        emit('created', response.data);
        close();
        toast.show('Tạo bài học thành công!', 'success');
    } catch (error) {
        console.error('Error creating lesson:', error);
        toast.show('Có lỗi xảy ra khi tạo bài học!', 'error');
    } finally {
        isSubmitting.value = false;
    }
};

const fetchClass = async () => {
  const response = await listClassApi();
  listClass.value = response.data;
};

const fetchStudent = async (idClass) => {
  const response = await listStudentApi(idClass);
  listStudent.value = response.data;
};

watch(
    () => props.dialog,
    (val) => {
        if (!val) {
            form.value = {
              title: '',
              content: '',
              status: 1
            };
            previewImageUrl.value = '';
        }
    }
);

// Thu hồi URL preview khi component bị hủy
onUnmounted(() => {
    if (previewImageUrl.value) {
        URL.revokeObjectURL(previewImageUrl.value);
    }
});
</script>

<style scoped>
.v-card-title {
    background: linear-gradient(90deg, #1976d2, #42a5f5);
    color: white;
    padding: 16px;
}
.v-card-text {
    padding: 24px;
}
.v-btn.btn-save {
    text-transform: none;
    font-weight: 500;
}
</style>
