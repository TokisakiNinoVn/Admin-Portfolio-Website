import { SkillType } from '@/constants/skill-type.enum';
import { SkillTypeMeta } from '@/metadata/skill-type.meta';

export function getSkillTypeLabel(type) {
    return SkillTypeMeta[type]?.label || type;
}

export const SkillTypeOptions = Object.entries(SkillTypeMeta).map(
    ([value, meta]) => ({
        value,
        title: meta.label,
    }),
);


export const SpeakingWritingSkillOptions = Object.entries(SkillTypeMeta)
    .filter(([value]) =>
        [SkillType.SPEAKING, SkillType.WRITING].includes(value)
    )
    .map(([value, meta]) => ({
        value,
        title: meta.label,
    }));
