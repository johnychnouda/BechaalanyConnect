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
}) => {
    try {
        const { data } = await api.post('/save-order', orderData);
        return data;
    } catch (error) {
        throw error;
    }
};

export const fetchUserOrders = async () => {
    try {
        const { data } = await api.get('/user/orders');
        return data;
    } catch (error) {
        // If the API endpoint doesn't exist yet, return empty orders
        // This allows the frontend to work while the backend is being developed
        console.warn('User orders API endpoint not available yet:', error);
        return { orders: [] };
    }
};

export const fetchCurrentUser = async () => {
    try {
        const { data } = await api.get('/user/profile');
        return data;
    } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
    }
};