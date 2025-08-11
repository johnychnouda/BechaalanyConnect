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

// Cache for session to avoid multiple calls
let sessionCache: any = null;
let sessionCacheTime = 0;
const SESSION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Enable debugging in development
const DEBUG_SESSION = process.env.NODE_ENV === 'development';

// Function to get cached session
const getCachedSession = async () => {
    const now = Date.now();
    
    // Return cached session if it's still valid
    if (sessionCache && (now - sessionCacheTime) < SESSION_CACHE_DURATION) {
        return sessionCache;
    }
    
    // Fetch fresh session
    try {
        const session = await getSession();
        sessionCache = session;
        sessionCacheTime = now;
        return session;
    } catch (error) {
        console.error('Error getting session:', error);
        return null;
    }
};

// Add request interceptor
api.interceptors.request.use(
    async (config) => {
        // Define public endpoints that don't need authentication
        const publicEndpoints = [
            '/general',
            '/home', 
            '/categories',
            '/about',
            '/contact',
            '/credit-types',
            '/contact-form-submit'
        ];
        
        // Check if the current request is to a public endpoint
        const isPublicEndpoint = publicEndpoints.some(endpoint => 
            config.url && config.url.includes(endpoint)
        );
        
        
        // Only get session for authenticated endpoints
        if (!isPublicEndpoint) {
            const session = await getCachedSession();
            if (session?.laravelToken) {
                config.headers.Authorization = `Bearer ${session.laravelToken}`;
            }
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

// Function to clear session cache (useful for logout)
export const clearSessionCache = () => {
    sessionCache = null;
    sessionCacheTime = 0;
};

// Function to manually refresh session cache
export const refreshSessionCache = async () => {
    sessionCache = null;
    sessionCacheTime = 0;
    return await getCachedSession();
};

export default api;
