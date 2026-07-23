/// file: src/apis/modules/dashboard.api.js
import api from '@/apis/axios';

const dashboardInforApi = async () => api.get(`/teacher/dashboard`)

export {
    dashboardInforApi
};

