<template>
    <v-dialog :model-value="dialog" @update:model-value="emit('update:dialog', $event)" max-width="600px" persistent>
        <v-card>
            <v-card-title class="text-h5 font-weight-bold">Thêm mới bạn bè hiển thị</v-card-title>
            <v-card-text>
                <v-form ref="formRef" @submit.prevent="submit">
                    <v-text-field
                        v-model="form.name"
                        label="Tên bạn bè"
                        variant="outlined"
                        density="compact"
                        required
                        class="mb-4"
                        :rules="[v => !!v || 'Tên bạn bè là bắt buộc']"
                    />
                    <v-text-field
                        v-model="form.avatar_link"
                        label="Ảnh đại diện"
                        variant="outlined"
                        density="compact"
                        required
                        class="mb-4"
                        :rules="[v => !!v || 'Ảnh đại diện là bắt buộc']"
                    />
                    <v-text-field
                        v-model="form.personal_website"
                        label="Website cá nhân"
                        variant="outlined"
                        density="compact"
                        required
                        class="mb-4"
                        :rules="[v => !!v || 'Website cá nhân là bắt buộc']"
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
                    Lưu
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import FriendService from '@/services/friends.service';
import { useToast } from '@/stores/toast.store';
import { defineEmits, defineProps, ref, watch } from 'vue';

const props = defineProps({
    dialog: Boolean
});
const emit = defineEmits(['update:dialog', 'created']);

const form = ref({
    name: '',
    avatar_link: '',
    personal_website: '',
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
            name: form.value.name,
            avatar_link: form.value.avatar_link,
            personal_website: form.value.personal_website,
            description: form.value.description,
        }

        const response = await FriendService.create(payload);
        console.log(response)
        emit('created', response);
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
                name: '',
                avatar_link: '',
                personal_website: '',
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
