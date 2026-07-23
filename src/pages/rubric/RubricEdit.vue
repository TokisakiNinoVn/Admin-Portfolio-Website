<template>
    <v-dialog :model-value="dialog" @update:model-value="emit('update:dialog', $event)" max-width="600px" persistent>
        <v-card>
            <v-card-title class="text-h5 font-weight-bold">
                {{ isUpdate ? 'Cập nhật rubric' : 'Thêm rubric mới' }}
            </v-card-title>
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
import { computed, defineEmits, defineProps, ref, watch } from 'vue';

const props = defineProps({
    rubric: {
        type: Object,
        default: null
    },
    dialog: Boolean
});
const emit = defineEmits(['update:dialog', 'created', 'updated']);
const toast = useToast();
const formRef = ref();
const isSubmitting = ref(false);

// Helper: tạo form rỗng (dùng cho thêm mới)
const getEmptyForm = () => ({
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

// Helper: khởi tạo form từ dữ liệu rubric (dùng cho cập nhật)
const initFormFromRubric = (rubric) => {
    if (!rubric) return getEmptyForm();
    
    let criteria = [];
    if (rubric.criteria && rubric.criteria.length) {
        criteria = rubric.criteria.map(c => ({
            id: c.id,                         // giữ lại id để cập nhật
            criterion_name: c.criterion_name,
            max_score: parseFloat(c.max_score),
            sort_order: c.sort_order
        }));
    } else {
        // Nếu rubric không có tiêu chí nào (hiếm), thêm một tiêu chí mặc định
        criteria = [{ criterion_name: '', max_score: 1, sort_order: 0 }];
    }

    return {
        name: rubric.name || '',
        description: rubric.description || '',
        skill_type: rubric.skill_type || 'speaking',
        criteria: criteria
    };
};

const form = ref(getEmptyForm());

// Computed: xác định đang ở chế độ cập nhật hay thêm mới
const isUpdate = computed(() => !!props.rubric && !!props.rubric.id);

// Thêm tiêu chí mới
const addCriterion = () => {
    form.value.criteria.push({
        criterion_name: '',
        max_score: 1,
        sort_order: form.value.criteria.length // tạm thời, sẽ được gán lại khi submit
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
        
        // Chuẩn bị mảng criteria, cập nhật sort_order theo đúng vị trí hiện tại
        const criteriaPayload = form.value.criteria.map((c, idx) => {
            const payload = {
                criterion_name: c.criterion_name,
                max_score: c.max_score,
                sort_order: idx
            };
            // Nếu tiêu chí có id (đang cập nhật) thì gửi kèm
            if (c.id) {
                payload.id = c.id;
            }
            return payload;
        });

        const payload = {
            name: form.value.name,
            description: form.value.description,
            skill_type: form.value.skill_type,
            criteria: criteriaPayload
        };

        if (isUpdate.value) {
            // Cập nhật rubric
            await RubricService.update(props.rubric.id, payload);
            emit('updated');
            toast.show('Cập nhật rubric thành công!', 'success');
        } else {
            // Tạo rubric mới
            await RubricService.create(payload);
            emit('created');
            toast.show('Tạo rubric thành công!', 'success');
        }
        close();
    } catch (error) {
        toast.show(`${isUpdate.value ? 'Cập nhật' : 'Tạo'} rubric thất bại: ${error.message || error}`, 'error');
    } finally {
        isSubmitting.value = false;
    }
};

// Khi dialog mở, cập nhật form theo rubric được truyền vào
watch(() => props.dialog, (val) => {
    if (!val) {
        // Đóng dialog: reset form về trạng thái rỗng (cho lần mở thêm mới tiếp theo)
        form.value = getEmptyForm();
    } else {
        // Mở dialog: load dữ liệu từ rubric hiện tại
        form.value = initFormFromRubric(props.rubric);
    }
});

// Nếu rubric thay đổi khi dialog đang mở (ví dụ chọn rubric khác), cập nhật form
watch(() => props.rubric, (newRubric) => {
    if (props.dialog && newRubric) {
        form.value = initFormFromRubric(newRubric);
    }
}, { deep: true });
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
