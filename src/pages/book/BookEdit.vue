<template>
    <v-dialog :model-value="dialog" @update:model-value="emit('update:dialog', $event)" max-width="600px" persistent>
        <v-card>
            <v-card-title class="text-h5 font-weight-bold">Cập nhật bài học</v-card-title>
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
                    <v-text-field
                        v-model="form.limit_time"
                        label="Thời gian giới hạn (phút)"
                        variant="outlined"
                        density="compact"
                        type="number"
                        class="mb-4"
                        :rules="[v => v >= 0 || 'Thời gian phải lớn hơn hoặc bằng 0']"
                    />

                    <!-- Hiển thị ảnh hiện tại -->
                    <v-row v-if="currentImageUrl" class="mb-4">
                        <v-col cols="12">
                            <v-subheader class="font-weight-medium">Ảnh bìa hiện tại</v-subheader>
                            <v-img
                                :src="formatURLImage(currentImageUrl)"
                                max-height="150"
                                max-width="300"
                                class="rounded-lg"
                                contain
                            />
                        </v-col>
                    </v-row>

                    <!-- Chọn và xem trước ảnh mới -->
                    <v-row class="mb-4">
                        <v-col cols="12">
                            <v-file-input
                                v-model="form.coverFile"
                                label="Chọn ảnh bìa mới"
                                accept="image/*"
                                show-size
                                variant="outlined"
                                density="compact"
                                @change="handleImageChange"
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
                    </v-row>

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

                    <!-- <v-select
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
                    Cập nhật
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { updateUnitApi } from '@/apis/modules/unit.api';
import { useToast } from '@/stores/toast.store';
import { formatURLImage } from '@/utils/format.util';
import { defineEmits, defineProps, onUnmounted, ref, watch } from 'vue';

const props = defineProps({
    dialog: Boolean,
    unit: Object
});
const emit = defineEmits(['update:dialog', 'updated']);

const levers = [
    { title: 'Dễ', value: 'normal' },
    { title: 'Trung bình', value: 'medium' },
    { title: 'Khó', value: 'hard' }
];
const types = [
    { title: 'Cuộc hội thoại', value: 'conversation' },
    { title: 'Từ vựng', value: 'vocabulary' },
    { title: 'Ngữ pháp', value: 'grammar' }
];

const form = ref({
    title: '',
    description: '',
    limit_time: '',
    coverFile: null,
    cover: '',
    is_new: 0,
    level: 'normal',
    // type: 'conversation',
    unit_id: ''
});

const toast = useToast();
const formRef = ref();
const isSubmitting = ref(false);
const currentImageUrl = ref('');
const previewImageUrl = ref('');

const close = () => {
    emit('update:dialog', false);
};

const handleImageChange = (file) => {
    if (file) {
        previewImageUrl.value = URL.createObjectURL(file);
    } else {
        previewImageUrl.value = '';
    }
};

const submit = async () => {
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    try {
        isSubmitting.value = true;
        const formData = new FormData();
        formData.append('unit_id', form.value.unit_id || '');
        formData.append('title', form.value.title);
        formData.append('description', form.value.description || '');
        formData.append('limit_time', form.value.limit_time || '');
        if (form.value.coverFile) {
            formData.append('cover', form.value.coverFile);
        }
        formData.append('is_new', form.value.is_new.toString());
        formData.append('level', form.value.level);
        formData.append('type', form.value.type);

        const response = await updateUnitApi(formData);
        emit('updated', response.data);
        close();
        toast.show('Cập nhật bài học thành công!', 'success');
    } catch (error) {
        console.error('Error updating unit:', error);
    } finally {
        isSubmitting.value = false;
    }
};

// Đồng bộ dữ liệu unit vào form khi dialog được mở
watch(
    () => ({ ...props.unit }),
    (unit) => {
        if (unit) {
            form.value = {
                title: unit.title || '',
                description: unit.description || '',
                limit_time: unit.limit_time || '',
                coverFile: null,
                cover: unit.cover || '',
                is_new: unit.is_new || 0,
                level: unit.level || 'normal',
                type: unit.type || 'conversation',
                unit_id: unit.id || ''
            };
            currentImageUrl.value = unit.cover || '';
            previewImageUrl.value = '';
        }
    },
    { immediate: true }
);

// Reset form khi dialog đóng
watch(
    () => props.dialog,
    (val) => {
        if (!val) {
            form.value = {
                title: '',
                description: '',
                limit_time: '',
                coverFile: null,
                cover: '',
                is_new: 0,
                level: 'normal',
                type: 'conversation',
                unit_id: ''
            };
            currentImageUrl.value = '';
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
