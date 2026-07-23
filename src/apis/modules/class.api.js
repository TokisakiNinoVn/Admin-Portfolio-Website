/// file: src/apis/modules/lesson.api.js
import api from '@/apis/axios';

const listClassApi = async () => api.get(`/teacher/classes/get`)

const detailStudentApi = async (id) => api.get(`/teacher/student/get/${id}`)

const listClassPointApi = async () => api.get(`/teacher/classescore`)

const listStudenByClassIdApi = async (id) => api.get(`/teacher/studentbyclass/${id}`)


export {
    detailStudentApi, listClassApi, listClassPointApi,
    listStudenByClassIdApi
};

