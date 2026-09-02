import api from '../utils/api';
import { getCategories } from './categories.service';

/**
 * NOTE ON ERROR HANDLING
 *
 * Every function in this file used to swallow its failures — the user-data fetchers
 * returned `{orders: [], total: 0}` and the public ones returned `undefined`. Two
 * consequences:
 *
 *   - An API outage was indistinguishable from an empty account: /account-dashboard
 *     rendered "No orders found." and its entire retry UI was unreachable dead code,
 *     because the catch block it depended on never ran.
 *   - GlobalContext received `undefined` and every CMS-managed label on the site
 *     silently rendered blank.
 *
 * They now reject. Callers are responsible for showing an error state, which is the
 * only way a user can tell "you have no orders" apart from "we cannot reach the
 * server right now".
 */


export const fetchGeneralData = async (locale: string) => {
    try {
        const { data } = await api.get(`/${locale}/general`);
        return data;
    } catch (error) {
        // Rethrown: a failed fetch must not look like empty data.
        throw error;
    }
};

export const fetchHomePageData = async (locale: string) => {
    try {
        const { data } = await api.get(`/${locale}/home`);
        return data;
    } catch (error) {
        // Rethrown: a failed fetch must not look like empty data.
        throw error;
    }
};

export const fetchCategoriesData = async (locale: string) => {
    try {
        const { data } = await api.get(`/${locale}/categories`);
        return data.categories; // Return data.data if it exists, otherwise return data
    } catch (error) {
        // The one deliberate fallback: a static category list keeps the storefront
        // navigable when the API is unreachable. Everything else rethrows.
        console.warn('Categories API unavailable, using the static fallback list:', error);
        return getCategories();
    }
};

export const fetchSubCategoriesData = async (locale: string, categorySlug: string) => {
    try {
        const { data } = await api.get(`/${locale}/categories/${categorySlug}`);
        return data;
    } catch (error) {
        // Rethrown: a failed fetch must not look like empty data.
        throw error;
    }
};

export const fetchProductsData = async (locale: string, categorySlug: string, subcategorySlug: string) => {
    try {
        const { data } = await api.get(`/${locale}/categories/${categorySlug}/${subcategorySlug}`);
        return data;
    } catch (error) {
        // Rethrown: a failed fetch must not look like empty data.
        throw error;
    }
};

export const fetchAboutUsData = async (locale: string) => {
    try {
        const { data } = await api.get(`/${locale}/about`);
        return data;
    } catch (error) {
        // Rethrown: a failed fetch must not look like empty data.
        throw error;
    }
};

export const fetchContactUsData = async (locale: string) => {
    try {
        const { data } = await api.get(`/${locale}/contact`);
        return data;
    } catch (error) {
        // Rethrown: a failed fetch must not look like empty data.
        throw error;
    }
};

export const fetchProductDetails = async (locale: string, category: string, subcategory: string, slug: string) => {
    try {
        const { data } = await api.get(`/${locale}/categories/${category}/${subcategory}/${slug}`);
        return data;
    } catch (error) {
        // Rethrown: a failed fetch must not look like empty data.
        throw error;
    }
};

export const submitContactForm = async (formData: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    lang?: string;
}) => {
    try {
        const { data } = await api.post('/contact-form-submit', formData);
        return data;
    } catch (error) {
        throw error;
    }
};

// The price, owner and status of the order are determined server-side
export const saveOrder = async (locale: string, orderData: {
    product_variation_id: number;
    quantity: number;
    recipient_phone_number?: string;
    recipient_user?: string;
}) => {
    try {
        const { data } = await api.post(`/${locale}/save-order`, orderData);
        return data;
    } catch (error) {
        throw error;
    }
};

export const submitKyc = async (locale: string, formData: FormData) => {
    try {
        const { data } = await api.post(`/${locale}/kyc/submit`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    } catch (error) {
        console.error('Error submitting verification documents:', error);
        throw error;
    }
};

export const fetchUserOrders = async (locale: string = 'en', page = 1, limit = 10) => {
    try {
        // Always use locale-aware endpoint for consistency with other user endpoints
        const { data } = await api.get(`/${locale}/user/orders?page=${page}&limit=${limit}`);
        return data;
    } catch (error) {
        // Was: return { orders: [], total: 0 } — which made an outage render as
        // "No orders found." and left my-orders.tsx's error branch unreachable.
        throw error;
    }
};

export const fetchUserOrder = async (locale: string = 'en', id: number | string) => {
    try {
        const { data } = await api.get(`/${locale}/user/orders/${id}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const fetchUserPayments = async (locale: string = 'en', page = 1, limit = 10) => {
  try {
    // Always use locale-aware endpoint for consistency with other user endpoints
    const { data } = await api.get(`/${locale}/user/credits?page=${page}&limit=${limit}`);
    return data;
  } catch (error) {
    // Was: return { credits: [], total: 0 } — see fetchUserOrders.
    throw error;
  }
};

export const fetchCurrentUser = async (locale: string = 'en') => {
    try {
        // Always use locale-aware endpoint since Laravel now requires it for translated userTypes
        const { data } = await api.get(`/${locale}/user/profile`);
        return data;
    } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
    }
};

export const fetchCreditTypes = async (locale: string) => {
    try {
        const { data } = await api.get(`/${locale}/credit-types`);
        return data;
    } catch (error) {
        console.error('Error fetching credit types:', error);
        throw error;
    }
};

export const fetchSingleCreditType = async (locale: string, slug: string) => {
    try {
        const { data } = await api.get(`/${locale}/credit-types/${slug}`);
        return data;
    } catch (error) {
        console.error('Error fetching single credit type:', error);
        throw error;
    }
};

export const submitCreditRequest = async (formData: FormData) => {
    try {
        const { data } = await api.post('/transfer-credit-request', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    } catch (error) {
        console.error('Error submitting credit request:', error);
        throw error;
    }
};

export const fetchDashboardSettings = async (locale: string) => {
    try {
        const { data } = await api.get(`/${locale}/dashboard-settings`);
        return data;
    } catch (error) {
        console.error('Error fetching dashboard settings:', error);
        throw error;
    }
};

export const updateUserInfo = async (locale: string, userData: any) => {
    try {
        const { data } = await api.put(`/${locale}/user/update`, userData);
        return data;
    } catch (error) {
        console.error('Error updating user info:', error);
        throw error;
    }
};

export const updateUserPassword = async (locale: string, passwordData: any) => {
    try {
        const { data } = await api.put(`/${locale}/change-password`, passwordData);
        return data;
    } catch (error) {
        console.error('Error updating user password:', error);
        throw error;
    }
};