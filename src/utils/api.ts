import axios from 'axios';
import { getSession } from 'next-auth/react';

// Create axios instance with default config
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor
api.interceptors.request.use(
    async (config) => {
        // Get token from NextAuth session
        const session = await getSession();
        if (session?.laravelToken) {
            config.headers.Authorization = `Bearer ${session.laravelToken}`;
        }
        return config;
    },
    (error) => {
        if (error) {
            const { data } = error.response;
            const backendMessage = data.message;
            return Promise.reject(backendMessage || 'An unexpected error occurred.');

        } else {
            return Promise.reject(error);
        }
    }
);

// Add response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { data } = error.response;
            const backendMessage = data.message;

            return Promise.reject(backendMessage || 'An unexpected error occurreddd.');

        } else if (error.request) {
            // The request was made but no response was received
            console.error('No Response:', error.request);
            return Promise.reject({
                type: 'network',
                message: 'No response from server. Please check your internet connection.'
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Request Error:', error.message);
            return Promise.reject({
                type: 'request',
                message: 'Error setting up the request.'
            });
        }
    }
);

export default api;
