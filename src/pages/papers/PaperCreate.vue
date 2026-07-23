<template>
  <v-dialog
    :model-value="dialog"
    @update:model-value="emit('update:dialog', $event)"
    max-width="900px"
    persistent
  >
    <v-card>
      <v-card-title class="dialog-header">
        <!-- <i class="fa-solid fa-file-circle-plus mr-2"></i> -->
        Thêm đề thi mới
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" @submit.prevent="submit">
          <!-- Thông tin chung -->

          <v-text-field
            v-model="form.title"
            label="Tên đề thi"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            :rules="[v => !!v || 'Tên đề thi là bắt buộc']"
          />

          <v-textarea
            v-model="form.instruction"
            label="Hướng dẫn làm bài"
            variant="outlined"
            density="comfortable"
            auto-grow
            rows="3"
            class="mb-4"
          />

          <v-checkbox
            v-model="form.random_mode"
            label="Trộn ngẫu nhiên các phần thi"
            color="primary"
          />

          <v-divider class="my-4" />

          <!-- Sections -->

          <div class="d-flex justify-space-between align-center mb-3">
            <h3 class="text-subtitle-1 font-weight-bold">
              Các phần thi
            </h3>

            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="fa-solid fa-plus"
              @click="addSection"
            >
              Thêm phần thi
            </v-btn>
          </div>

          <v-card
            v-for="(section, index) in form.sections"
            :key="index"
            variant="outlined"
            class="mb-4"
          >
            <v-card-title class="d-flex align-center">
              <span>Phần {{ index + 1 }}</span>

              <v-spacer />

              <v-btn
                v-if="form.sections.length > 1"
                icon
                color="error"
                variant="text"
                @click="removeSection(index)"
              >
                <i class="fa-solid fa-trash"></i>
              </v-btn>
            </v-card-title>

            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="section.skill_type"
                    :items="SkillTypeOptions"
                    item-title="title"
                    item-value="value"
                    label="Kỹ năng"
                    variant="outlined"
                    density="compact"
                    :rules="[v => !!v || 'Vui lòng chọn kỹ năng']"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="section.title"
                    label="Tên phần thi"
                    variant="outlined"
                    density="compact"
                    :rules="[v => !!v || 'Tên phần thi là bắt buộc']"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="section.duration_minutes"
                    label="Thời lượng"
                    variant="outlined"
                    density="compact"
                    :items="durationOptions"
                    item-title="title"
                    item-value="value"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="section.sort_order"
                    type="number"
                    label="Thứ tự"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-checkbox
                    v-model="section.lock_when_done"
                    label="Khóa sau khi hoàn thành"
                    hide-details
                  />
                </v-col>
              </v-row>
              <!-- <v-row>
                 <v-col cols="12" md="12">
                  <v-checkbox
                    v-model="section.auto_generate"
                    label="Tự động tạo câu hỏi"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="section.topic"
                    label="Chủ đề"
                    variant="outlined"
                    density="compact"
                    :items="durationOptions"
                    item-title="title"
                    item-value="value"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="section.difficulty_level"
                    label="Độ khó"
                    variant="outlined"
                    density="compact"
                    :items="durationOptions"
                    item-title="title"
                    item-value="value"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="section.question_type"
                    label="Loại câu hỏi"
                    variant="outlined"
                    density="compact"
                    :items="durationOptions"
                    item-title="title"
                    item-value="value"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="section.number_of_questions"
                    type="number"
                    label="Số lượng câu hỏi"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
              </v-row> -->
            </v-card-text>
          </v-card>
        </v-form>
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
        >
          <i class="fa-solid fa-check mr-2"></i>
          Lưu đề thi
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { createPaperApi } from '@/apis/modules/paper.api'
import { SkillTypeOptions } from '@/helpers/skill-type.helper'
import { useToast } from '@/stores/toast.store'
import { ref, watch } from 'vue'

const props = defineProps({
  dialog: Boolean,
  campaignId: String
})

const emit = defineEmits([
  'update:dialog',
  'created'
])

const toast = useToast()
const formRef = ref()
const isSubmitting = ref(false)

const durationOptions = [
  { title: '5 phút', value: 5 },
  { title: '10 phút', value: 10 },
  { title: '15 phút', value: 15 },
  { title: '20 phút', value: 20 },
  { title: '30 phút', value: 30 },
  { title: '45 phút', value: 45 },
  { title: '60 phút', value: 60 },
  { title: '90 phút', value: 90 },
  { title: '120 phút', value: 120 }
]

const defaultSection = (index = 0) => ({
  skill_type: 'listening',
  title: `Part ${index + 1}`,
  sort_order: index,
  duration_minutes: 10,
  lock_when_done: true
})

const defaultForm = () => ({
  title: '',
  instruction: '',
  random_mode: false,
  sections: [defaultSection()]
})

const form = ref(defaultForm())

const addSection = () => {
  form.value.sections.push(
    defaultSection(form.value.sections.length)
  )
}

const removeSection = (index) => {
  form.value.sections.splice(index, 1)

  form.value.sections.forEach((item, idx) => {
    item.sort_order = idx
  })
}

const close = () => {
  emit('update:dialog', false)
}

const submit = async () => {
  const { valid } = await formRef.value.validate()

  if (!valid) return

  try {
    isSubmitting.value = true

    const response = await createPaperApi(props.campaignId, form.value)

    emit('created', response.data)

    toast.show(
      'Tạo đề thi thành công!',
      'success'
    )

    close()
  } catch (error) {
    toast.show(
      error?.message || 'Tạo đề thi thất bại',
      'error'
    )
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => props.dialog,
  (opened) => {
    if (!opened) {
      form.value = defaultForm()
    }
  }
)
</script>

<style scoped>
.dialog-header {
  background: linear-gradient(
    90deg,
    #1976d2,
    #42a5f5
  );
  color: white;
  font-weight: 600;
}

.v-card-text {
  padding: 24px;
}
</style>
