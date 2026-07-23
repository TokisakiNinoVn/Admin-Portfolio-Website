/// file: src/apis/modules/student.api.js
import api from '@/apis/axios';

const listStudentApi = async (id) => api.get(`/teacher/students/get?school_class_id=${id}`)

export {
    listStudentApi
};

