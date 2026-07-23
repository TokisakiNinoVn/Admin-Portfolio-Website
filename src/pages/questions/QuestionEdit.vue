<template>
    <v-dialog :model-value="dialog" @update:model-value="emit('update:dialog', $event)" max-width="600px" persistent>
        <v-card>
            <v-card-title class="text-h5 font-weight-bold">Cập nhật câu hỏi</v-card-title>
            <v-card-text>
                <!-- Hiển thị loading khi đang lấy chi tiết -->
                <v-progress-linear v-if="loadingDetail" indeterminate color="primary" class="mb-4" />
                <v-form v-else ref="formRef" @submit.prevent="submit">
                    
                    <v-text-field
                        v-model="form.title"
                        label="Tiêu đề"
                        variant="outlined"
                        density="compact"
                        class="mb-4"
                        :rules="[v => !!v || 'Tiêu đề là bắt buộc']"
                    />
                    <v-textarea
                        v-model="form.instruction"
                        label="Hướng dẫn"
                        variant="outlined"
                        density="compact"
                        auto-grow
                        rows="3"
                        class="mb-4"
                    />

                    <v-row class="mt-2 mb-2">
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="form.difficulty_level"
                                label="Độ khó"
                                variant="outlined"
                                density="compact"
                                :items="DifficultyLevelTypeOptions"
                                item-title="title"
                                item-value="value"
                                :rules="[v => !!v || 'Độ khó là bắt buộc']"
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-select
                                v-model="form.skill_type"
                                label="Kỹ năng"
                                variant="outlined"
                                density="compact"
                                :items="SkillTypeOptions"
                                item-title="title"
                                item-value="value"
                                :rules="[v => !!v || 'Kỹ năng là bắt buộc']"
                            />
                        </v-col>
                    </v-row>
                    <!-- <v-select
                        v-model="form.difficulty_level"
                        label="Độ khó"
                        variant="outlined"
                        density="compact"
                        :items="DifficultyLevelTypeOptions"
                        item-title="title"
                        item-value="value"
                        class="mb-4"
                        :rules="[v => !!v || 'Độ khó là bắt buộc']"
                    /> -->
                    <v-select
                        v-model="form.exam_topic_id"
                        label="Chủ đề"
                        variant="outlined"
                        density="compact"
                        :items="topics"
                        item-title="name"
                        item-value="id"
                        class="mb-4"
                        :rules="[v => !!v || 'Chủ đề là bắt buộc']"
                    />
                    <!-- <v-select
                        v-model="form.skill_type"
                        label="Kỹ năng"
                        variant="outlined"
                        density="compact"
                        :items="SkillTypeOptions"
                        item-title="title"
                        item-value="value"
                        class="mb-4"
                        :rules="[v => !!v || 'Kỹ năng là bắt buộc']"
                    /> -->
                    <v-select
                        v-model="form.question_type"
                        label="Loại câu hỏi"
                        variant="outlined"
                        density="compact"
                        :items="QuestionTypeOptions"
                        item-title="title"
                        item-value="value"
                        class="mb-4"
                        :rules="[v => !!v || 'Loại câu hỏi là bắt buộc']"
                    />
                    <v-text-field
                        v-model="form.answer_explanation"
                        label="Giải thích đáp án"
                        variant="outlined"
                        density="compact"
                        class="mb-4"
                    />

                    <!-- content: fill_blank | essay | sentence_rewrite | read_aloud | recording -->
                    <template v-if="TYPES_WITH_CONTENT.includes(form.question_type)">
                        <v-textarea
                            v-model="form.content"
                            label="Nội dung câu hỏi"
                            variant="outlined"
                            density="compact"
                            auto-grow
                            rows="3"
                            class="mb-4"
                            :rules="[v => !!v || 'Nội dung là bắt buộc']"
                        />
                    </template>

                    <!-- MCQ -->
                    <template v-if="form.question_type === 'mcq'">
                        <div class="mb-2 text-subtitle-2 font-weight-bold">Các lựa chọn</div>
                        <div
                            v-for="(choice, index) in form.choices"
                            :key="index"
                            class="d-flex align-center gap-2 mb-3"
                        >
                            <v-checkbox
                                v-model="choice.is_correct"
                                density="compact"
                                hide-details
                                color="primary"
                                class="flex-shrink-0"
                            />
                            <v-text-field
                                v-model="choice.content"
                                :label="`Đáp án ${choice.label}`"
                                variant="outlined"
                                density="compact"
                                hide-details
                                :rules="[v => !!v || 'Không được để trống']"
                                class="flex-grow-1"
                            />
                            <v-btn
                                icon
                                variant="text"
                                color="error"
                                size="small"
                                :disabled="form.choices.length <= 2"
                                @click="removeChoice(index)"
                            >
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </div>
                        <v-btn
                            variant="tonal"
                            color="primary"
                            size="small"
                            :disabled="form.choices.length >= 6"
                            @click="addChoice"
                            class="mb-4"
                        >
                            <v-icon start>mdi-plus</v-icon>
                            Thêm lựa chọn
                        </v-btn>
                    </template>

                    <!-- fill_blank -->
                    <template v-if="form.question_type === 'fill_blank'">
                        <v-text-field
                            v-model="form.blank_answer"
                            label="Đáp án điền vào chỗ trống"
                            variant="outlined"
                            density="compact"
                            class="mb-4"
                            :rules="[v => !!v || 'Đáp án là bắt buộc']"
                        />
                        <v-combobox
                            v-model="form.blank_accepted_answers"
                            label="Các đáp án chấp nhận khác (nhấn Enter để thêm)"
                            variant="outlined"
                            density="compact"
                            multiple
                            chips
                            closable-chips
                            class="mb-4"
                        />
                    </template>

                    <!-- essay -->
                    <template v-if="form.question_type === 'essay'">
                        <v-textarea
                            v-model="form.sample_answer"
                            label="Đáp án mẫu"
                            variant="outlined"
                            density="compact"
                            auto-grow
                            rows="3"
                            class="mb-4"
                        />
                        <v-text-field
                            v-model.number="form.min_words"
                            label="Số từ tối thiểu"
                            variant="outlined"
                            density="compact"
                            type="number"
                            min="1"
                            class="mb-4"
                            :rules="[v => !v || v > 0 || 'Phải lớn hơn 0']"
                        />
                        <v-text-field
                            v-model.number="form.max_words"
                            label="Số từ tối đa"
                            variant="outlined"
                            density="compact"
                            type="number"
                            min="1"
                            class="mb-4"
                            :rules="[
                                v => !v || v > 0 || 'Phải lớn hơn 0',
                                v => !v || !form.min_words || v >= form.min_words || 'Phải lớn hơn hoặc bằng số từ tối thiểu'
                            ]"
                        />
                    </template>

                    <!-- sentence_rewrite -->
                    <template v-if="form.question_type === 'sentence_rewrite'">
                        <v-text-field
                            v-model="form.prefix_hint"
                            label="Gợi ý mở đầu (prefix hint)"
                            variant="outlined"
                            density="compact"
                            class="mb-4"
                            :rules="[v => !!v || 'Gợi ý mở đầu là bắt buộc']"
                        />
                        <v-textarea
                            v-model="form.sample_answer"
                            label="Đáp án mẫu"
                            variant="outlined"
                            density="compact"
                            auto-grow
                            rows="3"
                            class="mb-4"
                        />
                    </template>

                    <!-- recording -->
                    <template v-if="form.question_type === 'recording'">
                        <v-textarea
                            v-model="form.sample_answer"
                            label="Đáp án mẫu"
                            variant="outlined"
                            density="compact"
                            auto-grow
                            rows="3"
                            class="mb-4"
                        />
                        <v-text-field
                            v-model.number="form.speaking_prepare_seconds"
                            label="Thời gian chuẩn bị (giây)"
                            variant="outlined"
                            density="compact"
                            type="number"
                            min="0"
                            class="mb-4"
                            :rules="[v => v >= 0 || 'Không được âm']"
                        />
                        <v-text-field
                            v-model.number="form.speaking_answer_seconds"
                            label="Thời gian trả lời (giây)"
                            variant="outlined"
                            density="compact"
                            type="number"
                            min="1"
                            class="mb-4"
                            :rules="[v => v > 0 || 'Phải lớn hơn 0']"
                        />
                    </template>

                    <!-- listening -->
                    <template v-if="form.question_type === 'listening'">
                        <v-text-field
                            v-model.number="form.listening_play_limit"
                            label="Số lần phát tối đa"
                            variant="outlined"
                            density="compact"
                            type="number"
                            min="0"
                            class="mb-4"
                            :rules="[v => v >= 0 || 'Không được âm']"
                        />
                        <v-checkbox
                            v-model="form.listening_auto_next"
                            label="Tự động chuyển câu tiếp theo"
                            density="compact"
                            class="mb-4"
                        />
                    </template>

                    <!-- File audio hiện tại -->
                    <div v-if="currentAudioUrl" class="mb-2">
                        <span class="text-caption">Audio hiện tại: </span>
                        <a :href="currentAudioUrl" target="_blank" class="text-primary">Nghe file</a>
                    </div>
                    <v-file-input
                        v-model="form.audio_url"
                        label="File audio mới (mp3, wav, ogg, m4a – tối đa 20MB)"
                        variant="outlined"
                        density="compact"
                        accept=".mp3,.wav,.ogg,.m4a"
                        class="mb-4"
                        :disabled="loadingDetail"
                    />
                    <!-- File ảnh hiện tại -->
                    <div v-if="currentImageUrl" class="mb-2">
                        <span class="text-caption">Ảnh hiện tại: </span>
                        <a :href="currentImageUrl" target="_blank" class="text-primary">Xem ảnh</a>
                    </div>
                    <v-file-input
                        v-model="form.image_url"
                        label="File ảnh mới (jpeg, png, gif, webp – tối đa 5MB)"
                        variant="outlined"
                        density="compact"
                        accept=".jpg,.jpeg,.png,.gif,.webp"
                        class="mb-4"
                        :disabled="loadingDetail"
                    />

                    <v-text-field
                        v-model.number="form.score"
                        label="Điểm"
                        variant="outlined"
                        density="compact"
                        type="number"
                        min="1"
                        class="mb-4"
                        :rules="[v => v > 0 || 'Điểm phải lớn hơn 0']"
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
import { DifficultyLevelTypeOptions } from '@/helpers/difficulty-level.helper';
import { QuestionTypeOptions } from '@/helpers/question-type.helper';
import { SkillTypeOptions } from '@/helpers/skill-type.helper';
import QuestionService from '@/services/question.service';
import TopicService from '@/services/topic.service';
import { useToast } from '@/stores/toast.store';
import { defineEmits, defineProps, onMounted, ref, watch } from 'vue';

const props = defineProps({
    dialog: Boolean,
    question: Object   // chỉ dùng question.id
});

const emit = defineEmits(['update:dialog', 'updated']);

const CHOICE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
const TYPES_WITH_CONTENT = ['fill_blank', 'essay', 'sentence_rewrite', 'read_aloud', 'recording'];

const defaultForm = () => ({
    exam_topic_id: null,
    skill_type: '',
    difficulty_level: '',
    title: '',
    instruction: '',
    content: '',
    passage_content: '',
    answer_explanation: '',
    score: 100,
    question_type: '',
    audio_url: null,      // file mới chọn
    image_url: null,      // file mới chọn
    // listening
    listening_play_limit: 2,
    listening_auto_next: false,
    // recording
    speaking_prepare_seconds: 20,
    speaking_answer_seconds: 60,
    // fill_blank
    blank_answer: '',
    blank_accepted_answers: [],
    // essay / sentence_rewrite / recording
    sample_answer: '',
    min_words: null,
    max_words: null,
    // sentence_rewrite
    prefix_hint: '',
    // mcq
    choices: [
        { label: 'A', content: '', is_correct: false },
        { label: 'B', content: '', is_correct: false },
        { label: 'C', content: '', is_correct: false },
        { label: 'D', content: '', is_correct: false },
    ],
});

const form = ref(defaultForm());
const topics = ref([]);
const toast = useToast();
const formRef = ref();
const isSubmitting = ref(false);
const loadingDetail = ref(false);

const currentAudioUrl = ref('');
const currentImageUrl = ref('');
const currentQuestionId = ref(null);
const questionDetail = ref({});

const close = () => emit('update:dialog', false);

const addChoice = () => {
    if (form.value.choices.length >= 6) return;
    const nextLabel = CHOICE_LABELS[form.value.choices.length];
    form.value.choices.push({ label: nextLabel, content: '', is_correct: false });
};

const removeChoice = (index) => {
    if (form.value.choices.length <= 2) return;
    form.value.choices.splice(index, 1);
    form.value.choices.forEach((c, i) => { c.label = CHOICE_LABELS[i]; });
};

const fetchTopics = async () => {
    try {
        const response = await TopicService.list();
        topics.value = response.items.map(t => ({ id: t.id, name: t.name }));
    } catch {
        toast.show('Không thể tải danh sách chủ đề', 'error');
    }
};

// Populate form từ dữ liệu chi tiết trả về từ API
const populateFormFromDetail = (detail) => {
    if (!detail) return;
    
    const newForm = defaultForm();
    
    newForm.exam_topic_id = detail.exam_topic_id;
    newForm.skill_type = detail.skill_type;
    newForm.difficulty_level = detail.difficulty_level;
    newForm.title = detail.title || '';
    newForm.instruction = detail.instruction || '';
    newForm.content = detail.content || '';
    newForm.passage_content = detail.passage_content || '';
    newForm.answer_explanation = detail.answer_explanation || '';
    newForm.score = detail.score ?? 100;
    newForm.question_type = detail.question_type;
    
    newForm.listening_play_limit = detail.listening_play_limit ?? 2;
    newForm.listening_auto_next = detail.listening_auto_next ?? false;
    newForm.speaking_prepare_seconds = detail.speaking_prepare_seconds ?? 20;
    newForm.speaking_answer_seconds = detail.speaking_answer_seconds ?? 60;
    newForm.blank_answer = detail.blank_answer || '';
    
    if (detail.blank_accepted_answers) {
        newForm.blank_accepted_answers = Array.isArray(detail.blank_accepted_answers) 
            ? detail.blank_accepted_answers 
            : (typeof detail.blank_accepted_answers === 'string' ? JSON.parse(detail.blank_accepted_answers) : []);
    }
    
    newForm.sample_answer = detail.sample_answer || '';
    newForm.min_words = detail.min_words ?? null;
    newForm.max_words = detail.max_words ?? null;
    newForm.prefix_hint = detail.prefix_hint || '';
    
    // Xử lý choices (MCQ)
    if (detail.question_type === 'mcq' && detail.choices) {
        let choicesArr = Array.isArray(detail.choices) ? detail.choices : JSON.parse(detail.choices);
        newForm.choices = choicesArr.map((c, idx) => ({
            label: CHOICE_LABELS[idx] || String.fromCharCode(65 + idx),
            content: c.content || '',
            is_correct: c.is_correct || false
        }));
        while (newForm.choices.length < 4) {
            const nextLabel = CHOICE_LABELS[newForm.choices.length];
            newForm.choices.push({ label: nextLabel, content: '', is_correct: false });
        }
    } else {
        newForm.choices = defaultForm().choices;
    }
    
    // Lưu URL của file hiện tại (giả sử API trả về audio_url và image_url)
    currentAudioUrl.value = detail.audio_url || '';
    currentImageUrl.value = detail.image_url || '';
    
    form.value = newForm;
    formRef.value?.resetValidation();
};

// Gọi API lấy chi tiết câu hỏi
const fetchQuestionDetail = async (questionId) => {
    if (!questionId) return;

    loadingDetail.value = true;
    try {
        const response = await QuestionService.detail(questionId);
        
        // === SỬA LỖI CHÍNH Ở ĐÂY ===
        const detailData = response.data ?? response;   // Hỗ trợ cả 2 trường hợp
        console.log('Question Detail:', detailData);     // Debug rõ ràng

        if (!detailData?.id) {
            throw new Error('Dữ liệu câu hỏi không hợp lệ');
        }

        populateFormFromDetail(detailData);
    } catch (error) {
        console.error('Fetch question detail error:', error);
        toast.show(`Không thể tải chi tiết câu hỏi: ${error.message || 'Lỗi không xác định'}`, 'error');
        close();
    } finally {
        loadingDetail.value = false;
    }
};
// Reset toàn bộ form về trạng thái ban đầu
const resetForm = () => {
    form.value = defaultForm();
    currentAudioUrl.value = '';
    currentImageUrl.value = '';
    currentQuestionId.value = null;
    formRef.value?.resetValidation();
};

const buildPayload = () => {
    const f = form.value;
    const fd = new FormData();

    const append = (key, val) => {
        if (val !== null && val !== undefined && val !== '') {
            fd.append(key, val);
        }
    };

    // Base fields
    append('exam_topic_id', f.exam_topic_id);
    append('skill_type', f.skill_type);
    append('question_type', f.question_type);
    append('difficulty_level', f.difficulty_level);
    append('title', f.title);
    append('instruction', f.instruction);
    append('answer_explanation', f.answer_explanation);
    append('score', f.score);
    append('passage_content', f.passage_content);

    // Chỉ gửi file nếu người dùng chọn file mới
    if (f.audio_url) fd.append('audio_url', f.audio_url);
    if (f.image_url) fd.append('image_url', f.image_url);

    // Type-specific fields
    if (TYPES_WITH_CONTENT.includes(f.question_type)) {
        append('content', f.content);
    }

    if (f.question_type === 'mcq') {
        fd.append('choices', JSON.stringify(f.choices));
    }

    if (f.question_type === 'fill_blank') {
        append('blank_answer', f.blank_answer);
        if (f.blank_accepted_answers?.length) {
            fd.append('blank_accepted_answers', JSON.stringify(f.blank_accepted_answers));
        }
    }

    if (f.question_type === 'essay') {
        append('sample_answer', f.sample_answer);
        if (f.min_words) append('min_words', f.min_words);
        if (f.max_words) append('max_words', f.max_words);
    }

    if (f.question_type === 'sentence_rewrite') {
        append('prefix_hint', f.prefix_hint);
        append('sample_answer', f.sample_answer);
    }

    if (f.question_type === 'recording') {
        append('sample_answer', f.sample_answer);
        append('speaking_prepare_seconds', f.speaking_prepare_seconds);
        append('speaking_answer_seconds', f.speaking_answer_seconds);
    }

    if (f.question_type === 'listening') {
        append('listening_play_limit', f.listening_play_limit);
        fd.append('listening_auto_next', f.listening_auto_next);
    }

    return fd;
};

const submit = async () => {
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    if (form.value.question_type === 'mcq') {
        const hasCorrect = form.value.choices.some(c => c.is_correct);
        if (!hasCorrect) {
            toast.show('Vui lòng chọn ít nhất 1 đáp án đúng', 'error');
            return;
        }
        const allFilled = form.value.choices.every(c => !!c.content.trim());
        if (!allFilled) {
            toast.show('Vui lòng điền đầy đủ nội dung các lựa chọn', 'error');
            return;
        }
    }

    try {
        isSubmitting.value = true;
        const payload = buildPayload();
        const response = await QuestionService.update(currentQuestionId.value, payload);
        emit('updated', response);
        close();
        toast.show('Cập nhật câu hỏi thành công!', 'success');
    } catch (error) {
        toast.show(`Cập nhật câu hỏi thất bại: ${error.message}`, 'error');
    } finally {
        isSubmitting.value = false;
    }
};

// Khi dialog mở, lấy id từ props.question và gọi API detail
watch(() => props.dialog, async (isOpen) => {
    if (isOpen) {
        const id = props.question?.id;
        if (id) {
            currentQuestionId.value = id;
            await fetchQuestionDetail(id);
        } else {
            toast.show('Không tìm thấy ID câu hỏi', 'error');
            close();
        }
    } else {
        // Reset khi đóng
        form.value = defaultForm();
        currentAudioUrl.value = '';
        currentImageUrl.value = '';
        currentQuestionId.value = null;
        formRef.value?.resetValidation();
    }
});

// Chỉ watch id khi dialog đang mở
watch(() => props.question?.id, (newId) => {
    if (props.dialog && newId && newId !== currentQuestionId.value) {
        currentQuestionId.value = newId;
        fetchQuestionDetail(newId);
    }
});

onMounted(fetchTopics);
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
