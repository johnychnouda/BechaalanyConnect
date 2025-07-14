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
        return Promise.reject(error);
    }
);

// Add response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    console.error('Bad Request:', data);
                    // Handle validation errors
                    if (data.errors) {
                        return Promise.reject({
                            type: 'validation',
                            errors: data.errors
                        });
                    }
                    break;
                case 401:
                    console.error('Unauthorized:', data);
                    // Handle authentication errors via NextAuth signOut
                    // This will be handled by NextAuth automatically
                    return Promise.reject({
                        type: 'auth',
                        message: 'Session expired. Please login again.'
                    });
                case 403:
                    console.error('Forbidden:', data);
                    return Promise.reject({
                        type: 'permission',
                        message: 'You do not have permission to perform this action.'
                    });
                case 404:
                    console.error('Not Found:', data);
                    return Promise.reject({
                        type: 'not_found',
                        message: 'The requested resource was not found.'
                    });
                case 500:
                    console.error('Server Error:', data);
                    return Promise.reject({
                        type: 'server',
                        message: 'An unexpected error occurred. Please try again later.'
                    });
                default:
                    console.error('API Error:', data);
                    return Promise.reject({
                        type: 'unknown',
                        message: 'An unexpected error occurred.'
                    });
            }
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
