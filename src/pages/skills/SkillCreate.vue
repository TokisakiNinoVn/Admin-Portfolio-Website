<template>
    <v-dialog :model-value="dialog" @update:model-value="emit('update:dialog', $event)" max-width="700px" persistent>
        <v-card>
            <v-card-title class="text-h5 font-weight-bold">Thêm kỹ năng mới</v-card-title>
            
            <v-card-text class="pt-6">
                <v-form ref="formRef" @submit.prevent="submit" class="d-flex gap-8">
                    <!-- Phần form -->
                    <div class="flex-grow-1">
                        <v-text-field
                            v-model="form.name"
                            label="Tên kỹ năng"
                            variant="outlined"
                            density="compact"
                            required
                            class="mb-4"
                            :rules="[v => !!v || 'Tên kỹ năng là bắt buộc']"
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

                        <v-select
                            v-model="form.categories_skill_id"
                            label="Danh mục kỹ năng"
                            variant="outlined"
                            density="compact"
                            :items="categoriesSkills"
                            item-title="label"
                            item-value="id"
                            class="mb-4"
                            :rules="[v => !!v || 'Danh mục kỹ năng là bắt buộc']"
                        />

                        <v-text-field
                            v-model="form.label"
                            label="Nhãn (Label)"
                            variant="outlined"
                            density="compact"
                            required
                            class="mb-4"
                            :rules="[v => !!v || 'Nhãn là bắt buộc']"
                        />

                        <!-- Color Pickers -->
                        <div class="d-flex gap-4">
                            <div class="flex-1">
                                <label class="text-body-2 mb-1 d-block">Màu nền</label>
                                <v-color-picker
                                    v-model="form.background_color"
                                    hide-mode-switch
                                    mode="hex"
                                    dot-size="25"
                                    width="100%"
                                    class="mb-4 custom-color-picker"
                                    />
                                </div>
                                <div class="flex-1">
                                    <label class="text-body-2 mb-1 d-block">Màu chữ</label>
                                <v-color-picker
                                    class="mb-4 custom-color-picker"
                                    v-model="form.text_color"
                                    hide-mode-switch
                                    mode="hex"
                                    dot-size="25"
                                    width="100%"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Preview -->
                    <div class="preview-container">
                        <h4 class="text-subtitle-1 font-weight-medium mb-3">Preview Chip</h4>
                        
                        <!-- Light Mode -->
                        <div class="preview-box light-mode mb-4">
                            <div class="preview-label">Light Mode</div>
                            <v-chip
                                :style="{
                                    backgroundColor: form.background_color,
                                    color: form.text_color
                                }"
                                size="large"
                                label
                            >
                                {{ form.name || 'Tên kỹ năng' }}
                            </v-chip>
                        </div>

                        <!-- Dark Mode -->
                        <div class="preview-box dark-mode">
                            <div class="preview-label">Dark Mode</div>
                            <v-chip
                                :style="{
                                    backgroundColor: form.background_color,
                                    color: form.text_color
                                }"
                                size="large"
                                label
                            >
                                {{ form.name || 'Tên kỹ năng' }}
                            </v-chip>
                        </div>
                    </div>
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

<script setup>
import CategoriesSkillsService from '@/services/categories-skills.service';
import SkillsService from '@/services/skills.service';
import { useToast } from '@/stores/toast.store';
import { defineEmits, defineProps, onMounted, ref, watch } from 'vue';

const props = defineProps({ dialog: Boolean });
const emit = defineEmits(['update:dialog', 'created']);

const form = ref({
    name: '',
    label: '',
    description: '',
    categories_skill_id: null,
    background_color: '#009ef7',
    text_color: '#ffffff',
});

const categoriesSkills = ref([]);
const toast = useToast();
const formRef = ref();
const isSubmitting = ref(false);

const fetchCategoriesSkills = async () => {
    try {
        const response = await CategoriesSkillsService.list();
        categoriesSkills.value = response;
    } catch (error) {
        console.error('Error fetching categories skills:', error);
    }
};

const close = () => {
    emit('update:dialog', false);
};

const submit = async () => {
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    try {
        isSubmitting.value = true;
        const payload = { ...form.value };
        const response = await SkillsService.create(payload);
        emit('created', response);
        close();
        toast.show('Tạo kỹ năng thành công!', 'success');
    } catch (error) {
        console.error('Error creating skill:', error);
        toast.show('Có lỗi xảy ra khi tạo kỹ năng!', 'error');
    } finally {
        isSubmitting.value = false;
    }
};

// Reset form khi đóng dialog
watch(() => props.dialog, (val) => {
    if (!val) {
        form.value = {
            name: '',
            label: '',
            description: '',
            categories_skill_id: null,
            background_color: '#009ef7',
            text_color: '#ffffff',
        };
    }
});

onMounted(() => {
    fetchCategoriesSkills();
});
</script>

<style scoped>
.preview-container {
    width: 220px;
    flex-shrink: 0;
}

.preview-box {
    padding: 16px;
    border-radius: 8px;
    text-align: center;
    border: 1px solid #ddd;
}

.light-mode {
    background: #ffffff;
}

.dark-mode {
    background: #1e1e1e;
    border-color: #424242;
}

.preview-label {
    font-size: 0.75rem;
    color: #666;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.dark-mode .preview-label {
    color: #aaa;
}

.v-chip {
    font-weight: 500;
}

.custom-color-picker :deep(.v-color-picker-preview__eye-dropper) {
    background: rgb(133, 197, 149);
}
</style>
