/// file: src/apis/modules/lesson.api.js
import api from '@/apis/axios';

// const listActivityApi = async () => api.get(`/teacher/activities`)
const listActivityApi = async (id) => api.get(id ? `/teacher/activities?lesson_id=${id}` : `/teacher/activities`);
const listActivityByIdUnitApi = async (id) => api.get(id ? `/teacher/activities?lesson_id=${id}` : `/teacher/activities`);

const createActivityApi = async (formData) => {
    return api.post('/teacher/activities/store', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        timeout: 60000,
    });
};
const deleteActivityApi = async (data) => api.post('/teacher/activities/delete', data)

const updateActivityApi = async (formData) => {
    return api.post('/teacher/activities/update', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};


export {
    createActivityApi,
    deleteActivityApi,
    listActivityApi,
    listActivityByIdUnitApi,
    updateActivityApi
};

