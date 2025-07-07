import api from '../utils/axiosConfig';
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