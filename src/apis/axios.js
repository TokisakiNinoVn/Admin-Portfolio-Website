import { router } from '@/plugins/router/index';
import { getLocalStorage } from '@/utils/storage.utils';
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: baseURL + '/api/',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
  params: {},
  paramsSerializer: (params) => {
    return new URLSearchParams(params).toString()
  }
})

// Request Interceptor
api.interceptors.request.use(config => {
  const token = getLocalStorage('token')
  const email = getLocalStorage('email')

  if (token) config.headers['Authorization'] = `Bearer ${token}`
  if (email) config.headers['X-User-Email'] = email

  return config
})

// Response Interceptor
api.interceptors.response.use(
  response => response,
  error => {
    // console.log('Axios error interceptor:', error.response?.status)
    const { response } = error

    if (response) {
      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('email')
        router.push('/login')
        return response;
      }
      // else if (response.status === 403) {
      //   alert('Bạn không có quyền truy cập API này!')
      // }
    }

    return Promise.reject(error)
  }
)

export default api
