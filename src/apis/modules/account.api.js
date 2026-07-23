/// file: src/apis/modules/student.api.js
import api from '@/apis/axios';

const getInforAccountApi = async () => api.get(`/teacher/account/get`)
const updateAccountApi = async (data) => api.post(`/teacher/account/update`, data)

export {
    getInforAccountApi,
    updateAccountApi
};

