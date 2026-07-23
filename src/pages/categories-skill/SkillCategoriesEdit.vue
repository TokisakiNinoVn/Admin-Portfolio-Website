<template>
    <v-dialog :model-value="dialog" @update:model-value="emit('update:dialog', $event)" max-width="600px" persistent>
        <v-card>
            <v-card-title class="text-h5 font-weight-bold">Cập nhật danh mục kỹ năng</v-card-title>
            <v-card-text>
                <v-form ref="formRef" @submit.prevent="submit">
                    <v-text-field
                        v-model="form.label"
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
import SkillCategoriesService from '@/services/categories-skills.service';
import { useToast } from '@/stores/toast.store';
import { defineEmits, defineProps, ref, watch } from 'vue';

const props = defineProps({
    dialog: Boolean,
    skillCategories: Object
});
const emit = defineEmits(['update:dialog', 'updated']);

const form = ref({
    id: '',
    label: '',
    description: '',
});

const toast = useToast();
const formRef = ref();
const isSubmitting = ref(false);

const close = () => {
    emit('update:dialog', false);
};

const submit = async () => {
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    try {
        isSubmitting.value = true;
        const payload = {
            label: form.value.label,
            description: form.value.description,
        }
        console.log(form)

        const response = await SkillCategoriesService.update(form.value.id, payload);
        emit('updated', response);
        close();
        toast.show('Cập nhật danh mục kỹ năng thành công!', 'success');
    } catch (error) {
        console.error('Error updating skillCategories:', error);
        toast.show('Có lỗi xảy ra khi cập nhật danh mục kỹ năng!', 'error');
    } finally {
        isSubmitting.value = false;
    }
};

// Đồng bộ dữ liệu lesson vào form khi dialog được mở
watch(
    () => ({ ...props.skillCategories }),
    (skillCategories) => {
        if (skillCategories) {
            form.value = {
                id: skillCategories.id || '',
                label: skillCategories.label || '',
                description: skillCategories.description || '',
            };
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
                id: '',
                label: '',
                description: '',
            };
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
    padding: 24px;
}
.v-btn.btn-save {
    text-transform: none;
    font-weight: 500;
}
</style>
