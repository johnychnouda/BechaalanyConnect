import axios from 'axios';
import Router from 'next/router';
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
const SESSION_CACHE_DURATION = 10 * 60 * 1000; // Increased to 10 minutes

// Enable debugging in development
const DEBUG_SESSION = process.env.NODE_ENV === 'development';

// Track session fetch calls to prevent excessive requests
let sessionFetchCount = 0;
let lastSessionFetch = 0;
const MIN_SESSION_FETCH_INTERVAL = 1000; // Minimum 1 second between session fetches

// Function to get cached session
const getCachedSession = async () => {
    const now = Date.now();

    // Return cached session if it's still valid AND has a token
    if (sessionCache && (now - sessionCacheTime) < SESSION_CACHE_DURATION && sessionCache?.laravelToken) {
        return sessionCache;
    }

    // Rate limiting: prevent too frequent session fetches, but allow if no cache exists
    if (now - lastSessionFetch < MIN_SESSION_FETCH_INTERVAL && sessionCache) {
        return sessionCache;
    }

    // Fetch fresh session
    try {
        sessionFetchCount++;
        lastSessionFetch = now;

        const session = await getSession();
        sessionCache = session;
        sessionCacheTime = now;

        return session;
    } catch (error) {
        console.error('❌ Error getting session:', error);
        return sessionCache; // Return cached session on error if available
    }
};

// First path segments of endpoints that don't need authentication.
// Locale-prefixed URLs (e.g. /en/categories/...) are matched on the segment
// after the locale.
const PUBLIC_ENDPOINT_SEGMENTS = [
    'general',
    'home',
    'categories',
    'about',
    'contact',
    'credit-types',
    'contact-form-submit',
];

const LOCALES = ['en', 'ar'];

const isPublicEndpoint = (url?: string): boolean => {
    if (!url) return false;
    const segments = url.split('?')[0].replace(/^\//, '').split('/');
    const first = LOCALES.includes(segments[0]) ? segments[1] : segments[0];
    return PUBLIC_ENDPOINT_SEGMENTS.includes(first);
};

// Add request interceptor
api.interceptors.request.use(
    async (config) => {
        /*
         * Not every endpoint is locale-prefixed: /register, /verify-email,
         * /contact-form-submit and EVERY notification mutation live outside the
         * {locale} group in routes/api.php, so LocaleMiddleware never runs on them
         * and Laravel fell back to the `en` default. Sending the header on every
         * request lets ResolveRequestLocale pick the caller's language up instead.
         *
         * Router.locale is undefined before the router is ready (and on the server);
         * <html lang> is kept in sync with the active locale by _app.tsx, so it is a
         * reliable second source.
         */
        config.headers['Accept-Language'] =
            Router.locale ||
            (typeof document !== 'undefined' ? document.documentElement.lang : '') ||
            'en';

        // Only get session for authenticated endpoints
        if (!isPublicEndpoint(config.url)) {
            const session = await getCachedSession();
            if (session?.laravelToken) {
                config.headers.Authorization = `Bearer ${session.laravelToken}`;
            }
        }
        return config;
    },
    (error) => {
        // Request-phase errors have no response object
        if (error?.response?.data?.message) {
            return Promise.reject(error.response.data.message);
        }
        return Promise.reject(error);
    }
);

/**
 * The shape every rejected request now takes.
 *
 * Previously this interceptor rejected with three different things depending on which
 * branch it hit — a bare string for HTTP errors, and `{type, message}` objects for
 * network and setup errors. Callers wrote `toast.error(err)`, which rendered
 * "[object Object]" whenever the connection dropped, and the backend's machine-readable
 * `code` was thrown away entirely so no caller could branch on it.
 */
export interface ApiError {
    /** Human-readable, safe to display. */
    message: string;
    /** Machine-readable: 'insufficient_credits', 'kyc_required', 'network', … */
    code: string;
    /** HTTP status, absent for network/setup failures. */
    status?: number;
    /** Laravel 422 field errors. */
    errors?: Record<string, string[]>;
    /** Correlation id from the API for 500s — quote it in a support request. */
    ref?: string;
    /** Anything else the endpoint returned (e.g. balance/required/missing). */
    data?: Record<string, unknown>;
}

const isApiError = (value: unknown): value is ApiError =>
    typeof value === 'object' && value !== null && 'code' in value && 'message' in value;

export { isApiError };

// Add response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { data, status } = error.response;

            const apiError: ApiError = {
                message: data?.message || 'Something went wrong. Please try again.',
                code: data?.code || 'http_error',
                status,
                errors: data?.errors,
                ref: data?.ref,
                data,
            };

            return Promise.reject(apiError);
        }

        if (error.request) {
            // Request left the browser, nothing came back.
            return Promise.reject({
                message: 'No response from the server. Please check your internet connection.',
                code: 'network',
            } as ApiError);
        }

        return Promise.reject({
            message: 'The request could not be sent. Please try again.',
            code: 'request_setup',
        } as ApiError);
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
