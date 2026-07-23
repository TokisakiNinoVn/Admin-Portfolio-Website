/// file: src/apis/modules/campaign.api.js
import api from '@/apis/axios';

const listCampaignApi = async () => api.get('/teacher/exam/campaigns')
const listResultCampaignApi = async (id, params) => api.get(`/teacher/exam/campaigns/${id}/results`, { params })
const createCampaignApi = async (data) => api.post('/teacher/exam/campaigns', data)
const updateCampaignApi = async (id, data) => api.put(`/teacher/exam/campaigns/${id}`, data)
const deleteCampaignApi = async (id) => api.delete(`/teacher/exam/campaigns/${id}`)

export {
    createCampaignApi,
    deleteCampaignApi,
    listCampaignApi,
    listResultCampaignApi,
    updateCampaignApi
};

