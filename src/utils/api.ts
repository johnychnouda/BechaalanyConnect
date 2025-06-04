import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000', // Replace with your backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        // You can add authorization tokens or other custom headers here
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle errors globally
        return Promise.reject(error);
    }
);

// API function to fetch general settings
export const fetchGeneralSettings = async (locale: string) => {
    const response = await api.get(`/${locale}/general`);
    return response.data;
};

// API function to fetch homepage data
export const fetchHomepageData = async (locale: string) => {
    const response = await api.get(`/${locale}/home`);
    return response.data;
};

export default api;
