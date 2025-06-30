import api from '../utils/axiosConfig';

export const fetchGeneralData = async (locale: string) => {
    const { data } = await api.get(`/${locale}/general`);
    return data;
};

export const fetchHomePageData = async (locale: string) => {
    const { data } = await api.get(`/${locale}/home`);
    return data;
}; 