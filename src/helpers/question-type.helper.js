import { QuestionTypeMeta } from '@/metadata/question-type.meta';

export function getQuestionTypeLabel(type) {
    return QuestionTypeMeta[type]?.label || type;
}

export const QuestionTypeOptions = Object.entries(QuestionTypeMeta).map(
    ([value, meta]) => ({
        value,
        title: meta.label,
    }),
);
