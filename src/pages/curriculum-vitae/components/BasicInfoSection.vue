<template>
  <div class="flex flex-col gap-5">
    <!-- Avatar upload -->
    <div class="flex flex-col items-center w-full avatar-upload">
      <div class="avatar-dropzone group" @click="avatarInputRef?.click()">
        <v-img v-if="form.avatar?.url" :src="form.avatar.url" cover class="w-full h-full" />
        <div v-else class="avatar-placeholder">
          <i class="fa-solid fa-user text-3xl mb-1"></i>
          <span class="text-xs">Ảnh đại diện</span>
        </div>

        <div v-if="uploadingAvatar" class="avatar-loading">
          <i class="fa-solid fa-spinner fa-spin text-xl"></i>
        </div>
        <div class="avatar-overlay">
          <i class="fa-solid fa-camera text-lg mb-1"></i>
          <span class="text-xs font-medium">{{ form.avatar?.url ? 'Đổi ảnh' : 'Tải ảnh lên' }}</span>
        </div>
      </div>
      <span class="text-xs text-gray-500 mt-2">PNG, JPG tối đa 5MB</span>
      <input
        ref="avatarInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onAvatarFileChange"
      />
      <v-btn
        v-if="form.avatar?.url"
        color="error"
        variant="text"
        size="small"
        @click="removeAvatar"
      >
        <i class="fa-solid fa-trash mr-1"></i>
        Xóa ảnh
      </v-btn>
    </div>

    <v-select
      v-model="form.template"
      :items="templateOptions"
      item-value="value"
      item-title="label"
      label="Template"
      variant="outlined"
      density="comfortable"
      :rules="[v => !!v || 'Vui lòng chọn template']"
      required
      hide-details="auto"
      class="mb-4 mt-4"
    />

    <v-divider />

    <div class="grid grid-cols-1 gap-4">
      <v-text-field
        v-model="form.title"
        label="Tiêu đề CV"
        variant="outlined"
        density="comfortable"
        :rules="[v => !!v || 'Tiêu đề CV là bắt buộc']"
        required
        hide-details="auto"
        @blur="autoGenerateSlug"
      />

      <v-text-field
        v-model="form.slug"
        label="Slug"
        variant="outlined"
        density="comfortable"
        :rules="slugRules"
        required
        hide-details="auto"
        @input="onSlugInput"       
        @blur="sanitizeSlugOnBlur"
        placeholder="ten-cv-cua-ban"
      />

      <v-text-field
        v-model="form.full_name"
        label="Họ và tên"
        variant="outlined"
        density="comfortable"
        :rules="[v => !!v || 'Họ và tên là bắt buộc']"
        required
        hide-details="auto"
      />
      <v-text-field
        v-model="form.phone"
        label="Số điện thoại"
        variant="outlined"
        density="comfortable"
        :rules="[v => !!v || 'Số điện thoại là bắt buộc']"
        required
        hide-details="auto"
      />
      <v-text-field
        v-model="form.email"
        label="Email"
        variant="outlined"
        density="comfortable"
        :rules="[v => !v || /.+@.+\..+/.test(v) || 'Email không hợp lệ']"
        hide-details="auto"
      />
      <v-text-field
        v-model="form.address"
        label="Địa chỉ"
        variant="outlined"
        density="comfortable"
        hide-details="auto"
      />

      <v-row>
        <v-col cols="12" md="6">
          <v-select
            v-model="form.gender"
            :items="['Nam', 'Nữ', 'Khác']"
            label="Giới tính"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.birthday"
            label="Ngày sinh"
            variant="outlined"
            density="comfortable"
            type="date"
            hide-details="auto"
          />
        </v-col>
      </v-row>
    </div>

    <!-- Mạng xã hội -->
    <div>
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="text-subtitle-1 font-weight-bold">
          <i class="fa-solid fa-share-nodes mr-2 text-blue-500"></i>
          Liên kết mạng xã hội
        </span>
        <v-btn color="primary" variant="text" size="small" @click="addSocialLink">
          <i class="fa-solid fa-plus mr-1"></i> Thêm
        </v-btn>
      </div>

      <v-row
        v-for="(link, index) in form.social_links"
        :key="index"
        dense
        align="center"
        class="mb-2"
      >
        <v-col cols="3">
          <v-text-field
            v-model="link.name"
            label="Nền tảng"
            variant="outlined"
            density="compact"
            placeholder="VD: Facebook"
            hide-details
          />
        </v-col>
        <v-col cols="8">
          <v-text-field
            v-model="link.link"
            label="Đường dẫn"
            variant="outlined"
            density="compact"
            placeholder="https://..."
            hide-details
          />
        </v-col>
        <v-col cols="1" class="text-center">
          <v-btn icon size="small" color="error" variant="text" @click="removeSocialLink(index)">
            <i class="fa-solid fa-trash"></i>
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <!-- Crop Dialog -->
    <v-dialog v-model="cropDialog" max-width="700">
      <v-card>
        <v-card-title>Cắt ảnh đại diện</v-card-title>
        <v-card-text>
          <Cropper
            ref="cropperRef"
            :src="cropImageSrc"
            :stencil-props="{ aspectRatio: 1 }"
            image-restriction="stencil"
            class="cropper"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cropDialog = false">Hủy</v-btn>
          <v-btn color="primary" @click="confirmCrop">Xác nhận</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

const props = defineProps({
  form: { type: Object, required: true },
  templateOptions: { type: Array, required: true },
  uploadingAvatar: { type: Boolean, default: false },
  arraySlugCV: { type: Array, default: () => [] }
});

const emit = defineEmits(['upload-avatar', 'remove-avatar']);

const avatarInputRef = ref(null);
const cropperRef = ref(null);
const cropDialog = ref(false);
const cropImageSrc = ref('');

// ==================== SLUG LOGIC ====================
const generateSlug = (title = '') => {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')     // cho phép chữ, số, space, -
    .replace(/\s+/g, '-')             
    .replace(/-+/g, '-')              
    .replace(/^-|-$/g, '');
};

// Khi đang gõ (không sanitize mạnh)
const onSlugInput = () => {
  // Chỉ chuyển về lowercase và thay space thành - (cho phép gõ - tự do)
  if (props.form.slug) {
    props.form.slug = props.form.slug
      .toLowerCase()
      .replace(/\s+/g, '-');
  }
};

// Sanitize mạnh khi rời khỏi ô input
const sanitizeSlugOnBlur = () => {
  if (!props.form.slug) return;
  
  props.form.slug = generateSlug(props.form.slug);
};

const checkDuplicateSlug = (slug) => {
  if (!slug) return false;
  return props.arraySlugCV.some(s => s?.slug === slug);
};

const slugRules = computed(() => [
  v => !!v || 'Slug là bắt buộc',
  v => /^[a-z0-9-]+$/ .test(v) || 'Slug chỉ được chứa chữ thường, số và dấu "-"',
  v => !checkDuplicateSlug(v) || 'Slug này đã tồn tại, vui lòng chọn slug khác'
]);

// Tự động generate slug khi title thay đổi (nếu slug chưa được chỉnh tay)
const autoGenerateSlug = () => {
  if (!props.form.title) return;

  const generated = generateSlug(props.form.title);

  // Chỉ auto-fill nếu slug đang trống hoặc slug hiện tại giống với title cũ
  if (!props.form.slug || props.form.slug === generateSlug(props.form.title)) {
    props.form.slug = generated;
  }
};

// Watch title để auto generate ngay khi gõ
// Tự động generate từ title
watch(() => props.form.title, (newTitle) => {
  if (!newTitle) return;
  
  const generated = generateSlug(newTitle);
  
  // Chỉ tự động gán nếu slug đang trống hoặc giống với title cũ
  if (!props.form.slug || props.form.slug === generateSlug(props.form.title)) {
    props.form.slug = generated;
  }
}, { immediate: true });

// ==================== OTHER FUNCTIONS ====================

const onAvatarFileChange = (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;

  cropImageSrc.value = URL.createObjectURL(file);
  cropDialog.value = true;
};

const confirmCrop = () => {
  const result = cropperRef.value?.getResult();
  if (!result?.canvas) return;

  result.canvas.toBlob((blob) => {
    const file = new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });
    emit('upload-avatar', file);
    cropDialog.value = false;
    URL.revokeObjectURL(cropImageSrc.value);
    cropImageSrc.value = '';
  }, 'image/jpeg', 0.9);
};

const addSocialLink = () => {
  props.form.social_links.push({ name: '', link: '' });
};

const removeSocialLink = (index) => {
  props.form.social_links.splice(index, 1);
};

const removeAvatar = () => {
  emit('remove-avatar');
};
</script>

<style scoped>
.avatar-dropzone {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 18px;
  border: 2px dashed #90caf9;
  background: #f3f8ff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.avatar-dropzone:hover {
  border-color: #1976d2;
  background: #eaf3fd;
}
.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #64b5f6;
}
.avatar-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: opacity 0.2s ease;
}
.avatar-dropzone:hover .avatar-overlay {
  opacity: 1;
}
.avatar-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
  color: #1976d2;
}

.cropper {
  height: 450px;
  width: 100%;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.avatar-upload :deep(.hidden) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
