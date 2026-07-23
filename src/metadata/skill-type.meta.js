import { SkillType } from '@/constants/skill-type.enum';

export const SkillTypeMeta = {
  [SkillType.LISTENING]: {
    label: 'Nghe',
    color: 'primary',
    icon: 'mdi-format-list-bulleted',
  },

  [SkillType.READING]: {
    label: 'Đọc',
    color: 'success',
    icon: 'mdi-file-document-edit',
  },

  [SkillType.WRITING]: {
    label: 'Viết',
    color: 'warning',
    icon: 'mdi-pencil',
  },

  [SkillType.SPEAKING]: {
    label: 'Nói',
    color: 'info',
    icon: 'mdi-volume-high',
  },
};
