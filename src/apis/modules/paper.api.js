/// file: src/apis/modules/paper.api.js
import api from '@/apis/axios';

const listPaperByCampaignIdApi = async (id) => api.get(`/teacher/exam/campaigns/${id}/papers`)
const createPaperApi = async (id, data) => api.post(`/teacher/exam/campaigns/${id}/paper`, data)
const updatePaperApi = async (id, data) => api.put(`/teacher/exam/papers/${id}`, data)
const deletePaperApi = async (id) => api.delete(`/teacher/exam/papers/${id}`)

const detailPaperApi = async (id) => api.get(`/teacher/exam/papers/${id}`)
const deleteQuestionFromPaperApi = async (paperId, questionId) => api.delete(`/teacher/exam/papers/${paperId}/question/${questionId}`)
const addQuestionToPaperApi = async (id, data) => api.post(`/teacher/exam/papers/${id}/questions`, data)

export {
    addQuestionToPaperApi,
    createPaperApi,
    deletePaperApi, deleteQuestionFromPaperApi, detailPaperApi,
    listPaperByCampaignIdApi,
    updatePaperApi
};

