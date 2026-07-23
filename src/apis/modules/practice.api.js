/// file: src/apis/modules/practice.api.js
import api from '@/apis/axios';

const listPracticeApi = async () => api.get('/teacher/practices')

const createPracticeApi = async (data) => {
    return api.post('/teacher/practice', data);
};
const deletePracticeApi = async (practice_id) => api.post(`/teacher/practice/delete/${practice_id}`)
const detailsPracticeApi = async (practice_id) => api.get(`/teacher/practice/${practice_id}/activities`)

const updatePracticeApi = async (practice_id, data) => {
    return api.post(`/teacher/practice/update/${practice_id}`, data);
};


export {
    createPracticeApi,
    deletePracticeApi, detailsPracticeApi, listPracticeApi,
    updatePracticeApi
};

