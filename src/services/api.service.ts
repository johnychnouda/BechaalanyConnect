import api from '../utils/api';
import { getCategories } from './categories.service';

export const fetchGeneralData = async (locale: string) => {
    try {
        const { data } = await api.get(`/${locale}/general`);
        return data;
    } catch (error) {
        console.warn('API call failed, using fallback general data:', error);
    }
};

export const fetchHomePageData = async (locale: string) => {
    try {
        const { data } = await api.get(`/${locale}/home`);
        return data;
    } catch (error) {
        console.warn('API call failed, using fallback home page data:', error);
    }
};

export const fetchCategoriesData = async (locale: string) => {
    try {
        const { data } = await api.get(`/${locale}/categories`);
        return data.categories; // Return data.data if it exists, otherwise return data
    } catch (error) {
        console.warn('API call failed, using fallback categories:', error);
        // Return fallback categories if API fails
        return getCategories();
    }
};

export const fetchSubCategoriesData = async (locale: string, categorySlug: string) => {
    try {
        const { data } = await api.get(`/${locale}/categories/${categorySlug}`);
        return data;
    } catch (error) {
        console.warn('API call failed, using fallback sub categories:', error);
    }
};

export const fetchProductsData = async (locale: string, categorySlug: string, subcategorySlug: string) => {
    try {
        const { data } = await api.get(`/${locale}/categories/${categorySlug}/${subcategorySlug}`);
        return data;
    } catch (error) {
        console.warn('API call failed, using fallback products:', error);
    }
};

export const fetchAboutUsData = async (locale: string) => {
    try {
        const { data } = await api.get(`/${locale}/about`);
        return data;
    } catch (error) {
        console.warn('API call failed, using fallback about us data:', error);
    }
};

export const fetchContactUsData = async (locale: string) => {
    try {
        const { data } = await api.get(`/${locale}/contact`);
        return data;
    } catch (error) {
        console.warn('API call failed, using fallback contact us data:', error);
    }
};

export const fetchProductDetails = async (locale: string, category: string, subcategory: string, slug: string) => {
    try {
        const { data } = await api.get(`/${locale}/categories/${category}/${subcategory}/${slug}`);
        return data;
    } catch (error) {
        console.warn('API call failed, using fallback product details:', error);
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

export const saveOrder = async (orderData: {
    users_id: string;
    product_variation_id: number;
    quantity: number;
    total_price: number;
    recipient_phone_number: string;
    recipient_user: string;
    statuses_id: number;
    lang?: string;
}) => {
    try {
        const { data } = await api.post('/save-order', orderData);
        return data;
    } catch (error) {
        throw error;
    }
};

export const fetchUserOrders = async (locale: string = 'en', page = 1, limit = 10) => {
    try {
        // Always use locale-aware endpoint for consistency with other user endpoints
        const { data } = await api.get(`/${locale}/user/orders?page=${page}&limit=${limit}`);
        return data;
    } catch (error) {
        // If the API endpoint doesn't exist yet, return empty orders
        // This allows the frontend to work while the backend is being developed
        console.warn('User orders API endpoint not available yet:', error);
        return { orders: [], total: 0 };
    }
};

export const fetchUserPayments = async (locale: string = 'en', page = 1, limit = 10) => {
  try {
    // Always use locale-aware endpoint for consistency with other user endpoints
    const { data } = await api.get(`/${locale}/user/credits?page=${page}&limit=${limit}`);
    return data;
  } catch (error) {
    console.warn('User payments API endpoint not available yet:', error);
    return { credits: [], total: 0 };
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