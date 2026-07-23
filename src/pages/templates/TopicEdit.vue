<template>
    <v-dialog :model-value="dialog" @update:model-value="emit('update:dialog', $event)" max-width="600px" persistent>
        <v-card>
            <v-card-title class="text-h5 font-weight-bold">Cập nhật chủ đề</v-card-title>
            <v-card-text>
                <v-form ref="formRef" @submit.prevent="submit">
                    <v-text-field
                        v-model="form.name"
                        label="Tên chủ đề"
                        variant="outlined"
                        density="compact"
                        required
                        class="mb-4"
                        :rules="[v => !!v || 'Tên chủ đề là bắt buộc']"
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
import { updateTopicApi } from '@/apis/modules/topic.api';
import { useToast } from '@/stores/toast.store';
import { defineEmits, defineProps, ref, watch } from 'vue';

const props = defineProps({
    dialog: Boolean,
    topic: Object
});
const emit = defineEmits(['update:dialog', 'updated']);


const form = ref({
    name: '',
    description: '',
    topic_id: ''
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
        }

        const response = await updateTopicApi(form.value.topic_id, body);
        emit('updated', response.data);
        close();
        toast.show('Cập nhật chủ đề thành công!', 'success');
    } catch (error) {
        console.error('Error updating topic:', error);
    } finally {
        isSubmitting.value = false;
    }
};

// Đồng bộ dữ liệu topic vào form khi dialog được mở
watch(
    () => ({ ...props.topic }),
    (topic) => {
        if (topic) {
            form.value = {
                name: topic.name || '',
                description: topic.description || '',
                topic_id: topic.id || ''
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
                name: '',
                description: '',
                topic_id: ''
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
