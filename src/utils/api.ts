import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage or your auth state management
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
                    // Handle authentication errors
                    localStorage.removeItem('token');
                    window.location.href = '/auth/login';
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
