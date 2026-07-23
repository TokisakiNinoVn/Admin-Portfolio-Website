import { DifficultyLevel } from '@/constants/difficulty-level.enum';

export const DifficultyLevelMeta = {
  [DifficultyLevel.EASY]: {
    label: 'Dễ',
    color: 'success',
    icon: 'mdi-emoticon-happy-outline',
  },

  [DifficultyLevel.MEDIUM]: {
    label: 'Trung bình',
    color: 'info',
    icon: 'mdi-emoticon-neutral-outline',
  },

  [DifficultyLevel.HARD]: {
    label: 'Khó',
    color: 'error',
    icon: 'mdi-emoticon-poo-outline',
  }
};
