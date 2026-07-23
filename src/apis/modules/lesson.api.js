/// file: src/apis/modules/lesson.api.js
import api from '@/apis/axios';

const listLessonApi = async () => api.get(`/teacher/lessons`)
const listLessonByIdUnitApi = async (unit_id) => api.get(unit_id ? `/teacher/lessons?unit_id=${unit_id}` : `/teacher/lessons`);

const createLessonApi = async (formData) => {
    return api.post('/teacher/lessons/store', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};
const deleteLessonApi = async (data) => api.post('/teacher/lessons/delete', data)

const updateLessonApi = async (data) => api.post('/teacher/lessons/update', data)

export {
    createLessonApi,
    deleteLessonApi,
    listLessonApi,
    listLessonByIdUnitApi,
    updateLessonApi
};

