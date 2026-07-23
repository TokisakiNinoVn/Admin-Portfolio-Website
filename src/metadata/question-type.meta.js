import { QuestionType } from '@/constants/question-type.enum';

export const QuestionTypeMeta = {
  [QuestionType.MCQ]: {
    label: 'Trắc nghiệm',
    color: 'primary',
    icon: 'mdi-format-list-bulleted',
  },

  [QuestionType.ESSAY]: {
    label: 'Tự luận',
    color: 'success',
    icon: 'mdi-file-document-edit',
  },

  [QuestionType.RECORDING]: {
    label: 'Phát âm',
    color: 'warning',
    icon: 'mdi-microphone',
  },

  [QuestionType.READ_ALOUD]: {
    label: 'Đọc to',
    color: 'info',
    icon: 'mdi-volume-high',
  },

  [QuestionType.SENTENCE_REWRITE]: {
    label: 'Viết lại câu',
    color: 'secondary',
    icon: 'mdi-pencil',
  },

  [QuestionType.FILL_BLANK]: {
    label: 'Điền khuyết',
    color: 'error',
    icon: 'mdi-table-column',
  },
};
