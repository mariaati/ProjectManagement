import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from './userSlice';
import {
    getToken,
    removeToken,
    removeUserData,
    removeCookie,
} from '../../utils/Utils';

const baseUrl = `${import.meta.env.VITE_SERVER_ENDPOINT}/api`;

const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
        const token = getToken();
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const defaultFetchBase = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error?.status === 401 || result.error?.originalStatus === 401) {
        removeToken();
        removeUserData();
        removeCookie('refreshToken');
        removeCookie('isLoggedIn');
        api.dispatch(logout());
    }

    return result;
};

export default defaultFetchBase;
