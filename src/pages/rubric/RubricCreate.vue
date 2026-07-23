<template>
    <v-dialog :model-value="dialog" @update:model-value="emit('update:dialog', $event)" max-width="600px" persistent>
        <v-card>
            <v-card-title class="text-h5 font-weight-bold">Thêm rubric mới</v-card-title>
            <v-card-text>
                <v-form ref="formRef" @submit.prevent="submit">
                    <v-text-field
                        v-model="form.name"
                        label="Tên rubric"
                        variant="outlined"
                        density="compact"
                        required
                        class="mb-4"
                        :rules="[v => !!v || 'Tên rubric là bắt buộc']"
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
                    <VSelect
                        v-model="form.skill_type"
                        :items="SpeakingWritingSkillOptions"
                        item-title="title"
                        item-value="value"
                        label="Loại kỹ năng"
                        variant="outlined"
                        clearable
                        hide-details
                        class="mb-4"
                    />
                    <v-row 
                        v-for="(criterion, index) in form.criteria" 
                        :key="index"
                        align="center"
                        class="criterion-row mb-2"
                    >
                        <v-col cols="12" md="6" class="pb-0">
                            <v-text-field
                                v-model="criterion.criterion_name"
                                label="Tiêu chí"
                                variant="outlined"
                                density="compact"
                                placeholder="Ví dụ: Phát âm"
                                :rules="[v => !!v || 'Tiêu chí là bắt buộc']"
                            />
                        </v-col>
                        <v-col cols="12" md="4" class="pb-0">
                            <v-text-field
                                v-model.number="criterion.max_score"
                                label="Điểm tối đa"
                                variant="outlined"
                                density="compact"
                                type="number"
                                min="1"
                                max="100"
                                :rules="[
                                    v => !!v || 'Điểm là bắt buộc',
                                    v => !isNaN(v) || 'Phải là số',
                                    v => v >= 1 || 'Điểm tối thiểu là 1',
                                    v => v <= 100 || 'Điểm tối đa là 100'
                                ]"
                            />
                        </v-col>
                        <v-col cols="12" md="2" class="pb-0">
                            <v-btn
                                color="error"
                                variant="text"
                                @click="removeCriterion(index)"
                                size="small"
                                :disabled="form.criteria.length === 1"
                                title="Xóa tiêu chí"
                                class="w-100"
                            >
                                <i class="fa-solid fa-trash-can"></i>
                                <span class="ml-1 hidden-sm-and-down">Xóa</span>
                            </v-btn>
                        </v-col>
                    </v-row>

                    <v-row class="mt-1">
                        <v-col cols="12" class="d-flex justify-end">
                            <v-btn
                                color="primary"
                                variant="outlined"
                                @click="addCriterion"
                                size="small"
                            >
                                <i class="fa-solid fa-plus mr-2"></i>
                                Thêm tiêu chí
                            </v-btn>
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
                    Lưu
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { SpeakingWritingSkillOptions } from '@/helpers/skill-type.helper';
import RubricService from '@/services/rubric.service';
import { useToast } from '@/stores/toast.store';
import { defineEmits, defineProps, ref, watch } from 'vue';

const props = defineProps({
    dialog: Boolean
});
const emit = defineEmits(['update:dialog', 'created']);

const toast = useToast();
const formRef = ref();
const isSubmitting = ref(false);

// Khởi tạo form ban đầu
const getInitialForm = () => ({
    name: '',
    description: '',
    skill_type: 'speaking',
    criteria: [
        {
            criterion_name: '',
            max_score: 1,
            sort_order: 0
        }
    ]
});

const form = ref(getInitialForm());

// Thêm tiêu chí mới
const addCriterion = () => {
    form.value.criteria.push({
        criterion_name: '',
        max_score: 1,
        sort_order: form.value.criteria.length // tạm thời, sẽ được cập nhật lại khi submit
    });
};

// Xóa tiêu chí theo index
const removeCriterion = (index) => {
    if (form.value.criteria.length > 1) {
        form.value.criteria.splice(index, 1);
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
        
        // Chuẩn bị dữ liệu gửi lên, cập nhật sort_order dựa trên index
        const criteriaPayload = form.value.criteria.map((c, idx) => ({
            criterion_name: c.criterion_name,
            max_score: c.max_score,
            sort_order: idx
        }));

        const payload = {
            name: form.value.name,
            description: form.value.description,
            skill_type: form.value.skill_type,
            criteria: criteriaPayload
        };

        await RubricService.create(payload);
        emit('created');
        close();
        toast.show('Tạo chủ đề thành công!', 'success');
    } catch (error) {
        toast.show(`Tạo chủ đề thất bại: ${error.message || error}`, 'error');
    } finally {
        isSubmitting.value = false;
    }
};

// Reset form khi đóng dialog
watch(
    () => props.dialog,
    (val) => {
        if (!val) {
            form.value = getInitialForm();
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
.w-100 {
    width: 100%;
}
.mr-2 {
    margin-right: 8px;
}
.ml-1 {
    margin-left: 4px;
}
</style>
