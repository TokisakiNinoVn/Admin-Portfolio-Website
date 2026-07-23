/// file: src/apis/modules/topic.api.js
import api from '@/apis/axios';

const listTopicApi = async (params) => api.get('/teacher/exam/topics')
const createTopicApi = async (data) => api.post('/teacher/exam/topics', data)
const updateTopicApi = async (id, data) => api.put(`/teacher/exam/topics/${id}`, data)
const deleteTopicApi = async (id) => api.delete(`/teacher/exam/topics/${id}`)

export {
    createTopicApi, deleteTopicApi, listTopicApi, updateTopicApi
};

