/// file: src/apis/modules/unit.api.js
import api from '@/apis/axios';

const listUnitApi = async () => api.get('/teacher/units')

// const createUnitApi = async (data) => api.post('/teacher/units', 
    
// )
const createUnitApi = async (formData) => {
    return api.post('/teacher/units/store', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};
const deleteUnitApi = async (data) => api.post('/teacher/units/delete', data)

const updateUnitApi = async (formData) => {
    return api.post('/teacher/units/update', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};


export {
    createUnitApi,
    deleteUnitApi,
    listUnitApi,
    updateUnitApi
};

