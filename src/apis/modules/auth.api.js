/// file: src/apis/modules/auth.api.js
import api from '@/apis/axios';

const login = async ({ email, password }) => api.post('/teacher/login/auth', { email, password })
const loginGoogle = async (data) => api.post('/teacher/auth/google', data)

const sendOTP = async (data) => api.post('/auth/send-otp', data);

const checkOTP = async (data) => api.post('/auth/check-otp', data);

const resetPassword = async (data) => api.post('/auth/reset-password', data);

export { checkOTP, login, loginGoogle, resetPassword, sendOTP };

