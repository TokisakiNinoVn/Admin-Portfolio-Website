<template>
  <v-dialog :model-value="dialog" @update:model-value="emit('update:dialog', $event)" max-width="600px" persistent>
    <v-card>
      <v-card-title class="text-h5 font-weight-bold">Cập nhật cuộc hội thoại</v-card-title>
      <v-card-text>
        <v-form ref="formRef" @submit.prevent="submit">
          <!-- Tên tài liệu -->
          <v-text-field
            v-model="form.content"
            label="Nội dung"
            variant="outlined"
            density="compact"
            required
            class="mb-4"
            :rules="[v => !!v || 'Nội dung là bắt buộc']"
          />

          <!-- Loại tài liệu -->
          <v-select
            v-model="form.type"
            :items="types"
            item-title="title"
            item-value="value"
            label="Loại tài liệu"
            variant="outlined"
            density="compact"
            class="mb-4"
            required
            :rules="[v => !!v || 'Loại tài liệu là bắt buộc']"
          />

          <!-- File hiện tại -->
          <v-row v-if="currentFileUrl" class="mb-4">
            <v-col cols="12">
              <v-subheader class="font-weight-medium">File cuộc hội thoại hiện tại</v-subheader>
              <v-btn
                color="primary"
                variant="outlined"
                :href="currentFileUrl"
                target="_blank"
                class="mb-2"
              >
                <i :class="['fa-solid', 'fa-file-audio', 'mr-2']"></i>
                {{ getFileName(currentFileUrl) }}
              </v-btn>
            </v-col>
          </v-row>

          <!-- Chọn file mới -->
          <v-row class="mb-4">
            <v-col cols="12">
              <v-file-input
                v-model="form.audio_sample_url"
                label="Chọn file cuộc hội thoại mới"
                accept=".mp3"
                show-size
                variant="outlined"
                density="compact"
                prepend-icon=""
              >
                <template #prepend-inner>
                  <i class="fa-solid fa-file-arrow-up mr-2"></i>
                </template>
              </v-file-input>
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
          Cập nhật
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { updateSpeakingApi } from '@/apis/modules/speaking.api';
import { useToast } from '@/stores/toast.store';
import { defineEmits, defineProps, ref, watch } from 'vue';

const types = [
  { title: 'Cuộc hội thoại', value: 'conversation' },
  { title: 'Từ vựng', value: 'vocabulary' },
  { title: 'Ngữ pháp', value: 'grammar' },
  { title: 'Nói', value: 'speaking' } // thêm type speaking nếu cần
];

const props = defineProps({
  dialog: Boolean,
  document: Object
});
const emit = defineEmits(['update:dialog', 'updated']);

const form = ref({
  type: '',
  audio_sample_url: null as File | null,
  speaking_id: '',
  content: ''
});

const toast = useToast();
const formRef = ref();
const isSubmitting = ref(false);
const currentFileUrl = ref('');

const close = () => {
  emit('update:dialog', false);
};

const getFileName = (url: string) => {
  return url.split('/').pop() || '';
};

const submit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  try {
    isSubmitting.value = true;
    const formData = new FormData();
    formData.append('speaking_id', form.value.speaking_id || '');
    formData.append('content', form.value.content || '');
    formData.append('type', form.value.type || '');

    if (form.value.audio_sample_url) {
      formData.append('audio_sample_url', form.value.audio_sample_url);
    }

    const response = await updateSpeakingApi(formData);
    emit('updated', response.data);
    close();
    toast.show('Cập nhật tài liệu thành công!', 'success');
  } catch (error) {
    console.error('Error updating document:', error);
    toast.show('Có lỗi xảy ra khi cập nhật tài liệu!', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

// Khi dialog mở, đồng bộ dữ liệu từ props
watch(
  () => props.document,
  (doc) => {
    if (doc) {
      form.value = {
        speaking_id: doc.id || '',
        content: doc.content || '',
        audio_sample_url: null,
        type: doc.type || ''
      };
      currentFileUrl.value = doc.audio_sample_url || '';
    }
  },
  { immediate: true }
);

// Reset khi dialog đóng
watch(
  () => ({ ...props.document }), // clone object → luôn thay đổi reference
  (doc) => {
    if (doc) {
      form.value = {
        speaking_id: doc.id || '',
        content: doc.content || '',
        audio_sample_url: null,
        type: doc.type || ''
      };
      currentFileUrl.value = doc.audio_sample_url || '';
    }
  },
  { immediate: true }
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
