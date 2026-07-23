/// file: src/apis/modules/topic.api.js
import api from '@/apis/axios';

const listRubricApi = async () => api.get('/teacher/exam/rubrics')
const createRubricApi = async (data) => api.post('/teacher/exam/rubrics', data)
const updateRubricApi = async (id, data) => api.put(`/teacher/exam/rubrics/${id}`, data)
const deleteRubricApi = async (id) => api.delete(`/teacher/exam/rubrics/${id}`)

export {
    createRubricApi,
    deleteRubricApi,
    listRubricApi,
    updateRubricApi
};

