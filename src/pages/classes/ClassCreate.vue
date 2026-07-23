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
                        v-model="form.description"
                        label="Mô tả"
                        variant="outlined"
                        density="compact"
                        auto-grow
                        rows="3"
                        class="mb-4"
                    />
                    <!-- <v-text-field
                        v-model="form.limit_time"
                        label="Thời gian giới hạn (phút)"
                        variant="outlined"
                        density="compact"
                        type="number"
                        class="mb-4"
                        :rules="[v => v >= 0 || 'Thời gian phải lớn hơn hoặc bằng 0']"
                    /> -->

                    <!-- Chọn và xem trước ảnh -->
                    <!-- <v-row class="mb-4">
                        <v-col cols="12">
                            <v-file-input
                                v-model="form.coverFile"
                                label="Chọn ảnh cover"
                                accept="image/*"
                                show-size
                                variant="outlined"
                                density="compact"
                                @change="handleImageChange"
                                :multiple="false"
                            />
                            <v-img
                                v-if="previewImageUrl"
                                :src="previewImageUrl"
                                max-height="150"
                                max-width="300"
                                class="rounded-lg mt-2"
                                contain
                            />
                        </v-col>
                    </v-row> -->
<!-- 
                    <v-select
                        v-model="form.is_new"
                        :items="[{ title: 'Cũ', value: 0 }, { title: 'Mới', value: 1 }]"
                        item-title="title"
                        item-value="value"
                        label="Trạng thái (Mới/Cũ)"
                        variant="outlined"
                        density="compact"
                        class="mb-4"
                    />

                    <v-select
                        v-model="form.level"
                        :items="levers"
                        item-title="title"
                        item-value="value"
                        label="Chọn độ khó"
                        variant="outlined"
                        density="compact"
                        class="mb-4"
                    />

                    <v-select
                        v-model="form.type"
                        :items="types"
                        item-title="title"
                        item-value="value"
                        label="Loại bài học"
                        variant="outlined"
                        density="compact"
                    /> -->
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
import { createLessonApi } from '@/apis/modules/lesson.api';
import { useToast } from '@/stores/toast.store';
import { defineEmits, defineProps, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
    dialog: Boolean
});
const emit = defineEmits(['update:dialog', 'created']);

// const levers = [
//     { title: 'Dễ', value: 'normal' },
//     { title: 'Trung bình', value: 'medium' },
//     { title: 'Khó', value: 'hard' }
// ];
// const types = [
//   { title: 'Thực hành giao tiếp', value: 'conversation'},
//   { title: 'Từng từ', value: 'word' },
//   { title: 'Hội thoại', value: 'sentences' },
//   { title: 'Ngữ pháp', value: 'grammar' },
// ];

const form = ref({
    title: '',
    description: '',
    limit_time: '',
    coverFile: null as File | null,
    is_new: 0,
    level: 'normal',
    type: 'conversation'
});

const toast = useToast();
const formRef = ref();
const isSubmitting = ref(false);
const previewImageUrl = ref('');

const close = () => {
    emit('update:dialog', false);
};

const handleImageChange = (file: File | null) => {
    if (file) {
        previewImageUrl.value = URL.createObjectURL(file);
    } else {
        previewImageUrl.value = '';
    }
};
// const handleImageChange = (files: File[] | null) => {
//     const file = files?.[0] || null; // lấy file đầu tiên hoặc null
//     if (file) {
//         previewImageUrl.value = URL.createObjectURL(file);
//         form.value.coverFile = file;
//     } else {
//         previewImageUrl.value = '';
//         form.value.coverFile = null;
//     }
// };

const submit = async () => {
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    try {
        isSubmitting.value = true;
        const formData = new FormData();
        formData.append('title', form.value.title);
        formData.append('description', form.value.description || '');
        formData.append('limit_time', form.value.limit_time || '');
        if (form.value.coverFile) {
            formData.append('cover', form.value.coverFile);
        }
        formData.append('is_new', form.value.is_new.toString());
        formData.append('level', form.value.level);
        formData.append('type', form.value.type);

        const response = await createLessonApi(formData);
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

watch(
    () => props.dialog,
    (val) => {
        if (!val) {
            form.value = {
                title: '',
                description: '',
                limit_time: '',
                coverFile: null,
                is_new: 0,
                level: 'normal',
                type: 'conversation'
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
