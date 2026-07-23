/// file: src/apis/modules/notification.api.js
import api from '@/apis/axios';

const listNotificationApi = async () => api.get('/teacher/notifications')

const createNotificationApi = async (data) => api.post('/teacher/notifications/store', data)

const deleteNotificationApi = async (data) => api.post('/teacher/notifications/delete', data)

export {
    createNotificationApi,
    deleteNotificationApi, listNotificationApi
};

