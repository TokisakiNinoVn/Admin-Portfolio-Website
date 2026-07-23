<template>
    <v-dialog :model-value="dialog" @update:model-value="emit('update:dialog', $event)" max-width="600px" persistent>
        <v-card>
            <v-card-title class="text-h5 font-weight-bold">Cập nhật bạn bè</v-card-title>
            <v-card-text>
                <v-form ref="formRef" @submit.prevent="submit">
                    <v-text-field
                        v-model="form.name"
                        label="Tên"
                        variant="outlined"
                        density="compact"
                        required
                        class="mb-4"
                        :rules="[v => !!v || 'Tên là bắt buộc']"
                    />
                    <v-text-field
                        v-model="form.personal_website"
                        label="Website cá nhân"
                        variant="outlined"
                        density="compact"
                        class="mb-4"
                    />
                    <v-text-field
                        v-model="form.avatar_link"
                        label="Ảnh đại diện"
                        variant="outlined"
                        density="compact"
                        class="mb-4"
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
import FriendsService from '@/services/friends.service';
import { useToast } from '@/stores/toast.store';
import { defineEmits, defineProps, ref, watch } from 'vue';

const props = defineProps({
    dialog: Boolean,
    friends: Object
});
const emit = defineEmits(['update:dialog', 'updated']);

const form = ref({
    id: '',
    name: '',
    personal_website: '',
    avatar_link: '',
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
            personal_website: form.value.personal_website,
            avatar_link: form.value.avatar_link,
            description: form.value.description,
        }
        console.log(form)

        const response = await FriendsService.update(form.value.id, payload);
        emit('updated', response);
        close();
        toast.show('Cập nhật bạn bè thành công!', 'success');
    } catch (error) {
        console.error('Error updating friends:', error);
        toast.show('Có lỗi xảy ra khi cập nhật bạn bè!', 'error');
    } finally {
        isSubmitting.value = false;
    }
};

// Đồng bộ dữ liệu lesson vào form khi dialog được mở
watch(
    () => props.friends,
    (friends) => {
        if (friends) {
            form.value = {
                id: friends.id || '',
                name: friends.name || '',
                personal_website: friends.personal_website || '',
                avatar_link: friends.avatar_link || '',
                description: friends.description || '',
            };
        }
    },
    { immediate: true }
);

// Reset form khi dialog đóng
watch(
  () => props.dialog,
  (open) => {
    if (!open || !props.friends) return;

    form.value = {
      id: props.friends.id ?? "",
      name: props.friends.name ?? "",
      personal_website: props.friends.personal_website ?? "",
      avatar_link: props.friends.avatar_link ?? "",
      description: props.friends.description ?? "",
    };
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
