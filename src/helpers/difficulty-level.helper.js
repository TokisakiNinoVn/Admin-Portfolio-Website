import { DifficultyLevelMeta } from '@/metadata/difficulty-level.meta';

export function getDifficultyLevelLabel(level) {
    return DifficultyLevelMeta[level]?.label || level;
}

export const DifficultyLevelTypeOptions = Object.entries(DifficultyLevelMeta).map(
    ([value, meta]) => ({
        value,
        title: meta.label,
    }),
);
