/// file: src/apis/modules/lesson.api.js
import api from '@/apis/axios';

const listDocumentApi = async () => api.get('/teacher/documents')

const createDocumentApi = async (formData) => {
    return api.post('/teacher/documents/store', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};
const deleteDocumentApi = async (data) => api.post('/teacher/documents/delete', data)

const updateDocumentApi = async (formData) => {
    return api.post('/teacher/documents/update', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};


export {
    createDocumentApi,
    deleteDocumentApi,
    listDocumentApi,
    updateDocumentApi
};

