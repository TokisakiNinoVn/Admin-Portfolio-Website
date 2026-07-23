<template>
    <v-dialog :model-value="dialog" @update:model-value="emit('update:dialog', $event)" max-width="600px" persistent>
        <v-card>
            <v-card-title class="text-h5 font-weight-bold">Thêm đợt thi mới</v-card-title>
            <v-card-text>
                <v-form ref="formRef" @submit.prevent="submit">
                    <v-text-field
                        v-model="form.title"
                        label="Tên đợt thi"
                        variant="outlined"
                        density="compact"
                        required
                        class="mb-4"
                        :rules="[v => !!v || 'Tên đợt thi là bắt buộc']"
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
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field
                            v-model="form.start_time"
                            label="Thời gian bắt đầu"
                            type="datetime-local"
                            variant="outlined"
                            density="compact"
                            required
                            :rules="[v => !!v || 'Thời gian bắt đầu là bắt buộc']"
                        />
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field
                            v-model="form.end_time"
                            label="Thời gian kết thúc"
                            type="datetime-local"
                            variant="outlined"
                            density="compact"
                            required
                            :rules="[
                                v => !!v || 'Thời gian kết thúc là bắt buộc',
                                v => new Date(v) > new Date(form.start_time) || 'Thời gian kết thúc phải sau thời gian bắt đầu'
                            ]"
                        />
                    </v-col>
                </v-row>

                <v-select
                    v-model="form.duration_minutes"
                    label="Thời lượng làm bài"
                    variant="outlined"
                    density="compact"
                    :items="durationOptions"
                    item-title="title"
                    item-value="value"
                    required
                    class="mb-4 mt-4"
                    :rules="[v => !!v || 'Thời lượng là bắt buộc']"
                />
                
                <v-checkbox
                    v-model="form.allow_skill_navigation"
                    label="Cho phép chuyển qua lại giữa các kỹ năng trong khi làm bài kiểm tra"
                    class="mb-4"
                />
                <v-checkbox
                    v-model="form.auto_submit"
                    label="Tự động nộp bài"
                    class="mb-4"
                />
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
import { createCampaignApi } from '@/apis/modules/campaign.api';
import { useToast } from '@/stores/toast.store';
import { defineEmits, defineProps, ref, watch } from 'vue';

const props = defineProps({
    dialog: Boolean
});

const durationOptions = [
    { title: '15 phút', value: 15 },
    { title: '30 phút', value: 30 },
    { title: '45 phút', value: 45 },
    { title: '60 phút (1 giờ)', value: 60 },
    { title: '90 phút (1.5 giờ)', value: 90 },
    { title: '120 phút (2 giờ)', value: 120 },
    { title: '180 phút (3 giờ)', value: 180 }
];

const formatDateTime = (dateTime) => {
    if (!dateTime) return null;

    return dateTime
        .replace('T', ' ')
        .concat(':00');
};

// {
//   "title": "Kiểm tra Học kỳ II - Lớp 5",
//   "description": "Bài kiểm tra cuối học kỳ II năm học 2025-2026",
//   "start_time": "2026-06-10 07:30:00",
//   "end_time": "2026-06-10 09:30:00",
//   "duration_minutes": 45,
//   "allow_skill_navigation": false,
//   "auto_submit": true
// }
const emit = defineEmits(['update:dialog', 'created']);

const form = ref({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    duration_minutes: 45,
    allow_skill_navigation: false,
    auto_submit: true
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
        const body = {
            title: form.value.title,
            description: form.value.description,
            start_time: formatDateTime(form.value.start_time),
            end_time: formatDateTime(form.value.end_time),
            duration_minutes: Number(form.value.duration_minutes),
            allow_skill_navigation: form.value.allow_skill_navigation,
            auto_submit: form.value.auto_submit
        };
        const response = await createCampaignApi(body);
        emit('created', response.data);
        close();
        toast.show('Tạo đợt thi thành công!', 'success');
    } catch (error) {
        toast.show(`Tạo đợt thi thất bại: ${error.message} - ${error}`, 'error');
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
                start_time: '',
                end_time: '',
                duration_minutes: 45,
                allow_skill_navigation: false,
                auto_submit: true
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
