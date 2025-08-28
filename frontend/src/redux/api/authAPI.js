import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setToken, setUserData } from '../../utils/Utils';
import { getMeAPI } from './getMeAPI';

const baseUrl = `${import.meta.env.VITE_SERVER_ENDPOINT}/api`;

export const authAPI = createApi({
    reducerPath: 'authAPI',
    baseQuery: fetchBaseQuery({
        baseUrl,
        credentials: 'include', //  Needed for cookies
    }),
    endpoints: (builder) => ({
        //  Login Mutation
        loginUser: builder.mutation({
            query: (data) => ({
                url: '/auth/login',
                method: 'POST',
                body: data,
            }),
            async onQueryStarted(_args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    //  Store access token & user data in local storage
                    setToken(data.accessToken); // backend returns { accessToken }
                    setUserData(JSON.stringify(data.userData)); // backend returns { userData }
                    //  Trigger getMe to update user info in state
                    dispatch(getMeAPI.endpoints.getMe.initiate(null));
                } catch (error) {
                    console.error('Login failed:', error);
                }
            },
        }),

        //  Register Mutation
        registerUser: builder.mutation({
            query: (data) => ({
                url: '/auth/register',
                method: 'POST',
                body: data,
            }),
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (error) {
                    console.error('Registration failed:', error);
                }
            },
        }),
    }),
});

export const { useLoginUserMutation, useRegisterUserMutation } = authAPI;
