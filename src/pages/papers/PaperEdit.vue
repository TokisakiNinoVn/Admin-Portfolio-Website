<template>
    <v-dialog
        :model-value="dialog"
        @update:model-value="emit('update:dialog', $event)"
        max-width="600px"
        persistent
    >
        <v-card>
            <v-card-title class="text-h5 font-weight-bold">
                Cập nhật đợt thi
            </v-card-title>

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
                            :rules="[
                                v => !!v || 'Thời gian bắt đầu là bắt buộc'
                            ]"
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
                                v =>
                                    new Date(v) > new Date(form.start_time) ||
                                    'Thời gian kết thúc phải sau thời gian bắt đầu'
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

                <v-btn
                    color="grey"
                    variant="text"
                    @click="close"
                >
                    Hủy
                </v-btn>

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
import { updateCampaignApi } from '@/apis/modules/campaign.api';
import { useToast } from '@/stores/toast.store';
import { defineEmits, defineProps, ref, watch } from 'vue';

const props = defineProps({
    dialog: Boolean,
    campaign: Object
});
const emit = defineEmits(['update:dialog', 'updated']);

const form = ref({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    duration_minutes: 45,
    allow_skill_navigation: false,
    auto_submit: true,
    campaign_id: ''
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
           name: form.value.name, 
           description: form.value.description || '',
           start_time: form.value.start_time || '',
           end_time: form.value.end_time || '',
           duration_minutes: form.value.duration_minutes || 45,
           allow_skill_navigation: form.value.allow_skill_navigation || false,
           auto_submit: form.value.auto_submit || true,
           campaign_id: form.value.campaign_id || ''
        }

        const response = await updateCampaignApi(form.value.campaign_id, body);
        emit('updated', response.data);
        close();
        toast.show('Cập nhật chủ đề thành công!', 'success');
    } catch (error) {
        console.error('Error updating campaign:', error);
    } finally {
        isSubmitting.value = false;
    }
};

// Đồng bộ dữ liệu campaign vào form khi dialog được mở
watch(
    () => ({ ...props.campaign }),
    (campaign) => {
        if (campaign) {
            form.value = {
                title: campaign.title || '',
                description: campaign.description || '',
                campaign_id: campaign.id || '',

                start_time: campaign.start_time
                    ? new Date(campaign.start_time)
                        .toISOString()
                        .slice(0, 16)
                    : '',

                end_time: campaign.end_time
                    ? new Date(campaign.end_time)
                        .toISOString()
                        .slice(0, 16)
                    : '',

                duration_minutes: campaign.duration_minutes || 45,
                allow_skill_navigation: campaign.allow_skill_navigation ?? false,
                auto_submit: campaign.auto_submit ?? true
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
                title: '',
                description: '',
                campaign_id: '',
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
.v-card-name {
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
