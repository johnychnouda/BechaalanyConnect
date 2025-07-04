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
        return  data.categories; // Return data.data if it exists, otherwise return data
    } catch (error) {
        console.warn('API call failed, using fallback categories:', error);
        // Return fallback categories if API fails
        return getCategories();
    }
};