/// file: src/apis/modules/question.api.js
import api from '@/apis/axios';

const listQuestionApi = async (query) => api.get(`/teacher/exam/questions`, { params: query })

const createQuestionApi = async (formData) => {
    return api.post('/teacher/exam/questions', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};
const updateQuestionApi = async (id, data) => api.put(`/teacher/exam/questions/${id}`, data)
const deleteQuestionApi = async (id) => api.delete(`/teacher/exam/questions/${id}`)
const getQuestionApi = async (id) => api.get(`/teacher/exam/questions/${id}`)

export { createQuestionApi, deleteQuestionApi, getQuestionApi, listQuestionApi, updateQuestionApi };

