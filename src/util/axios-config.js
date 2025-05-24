import { API_URL } from '@/constants';
import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
});

// Request interceptor - add Authorization header
axiosInstance.interceptors.request.use(
    (config) => {
        const token = Cookies.get('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle 401 errors (unauthorized)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // If the error is due to authentication (401)
        if (error.response && error.response.status === 401 && !error.config._retry) {
            // Clear token and auth data
            console.warn('[axios-config] Removing access_token cookie due to 401:', Cookies.get('access_token'));
            Cookies.remove('access_token', { path: '/' });

            // Redirect to login if not already on login page
            if (!window.location.pathname.includes('/auth/login')) {
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
