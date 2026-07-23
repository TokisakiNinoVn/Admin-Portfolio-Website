/// file: src/apis/modules/lesson.api.js
import api from '@/apis/axios';

const listSpeakingApi = async () => api.get('/teacher/speakings')

// const createSpeakingApi = async (data) => api.post('/teacher/speaking', 
    
// )
const createSpeakingApi = async (formData) => {
    return api.post('/teacher/speakings/store', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        timeout: 0
    });
};

const deleteSpeakingApi = async (data) => api.post('/teacher/speakings/delete', data)

const updateSpeakingApi = async (formData) => {
    return api.post('/teacher/speakings/update', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        timeout: 0
    });
};

const addSpeakingPivot = async (data) => api.post('/teacher/lessons/speaking/add', data)

export {
    addSpeakingPivot, createSpeakingApi,
    deleteSpeakingApi,
    listSpeakingApi,
    updateSpeakingApi
};

