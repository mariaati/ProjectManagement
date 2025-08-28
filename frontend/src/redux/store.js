import { configureStore } from '@reduxjs/toolkit';
import { authAPI } from './api/authAPI';
import { getMeAPI } from './api/getMeAPI';
import { useDispatch, useSelector } from 'react-redux';
import userReducer from './api/userSlice';
import { projectAPI } from './api/projectAPI';
import { technologyAPI } from './api/technologyAPI';
import { facultyAPI } from './api/facultyAPI';

export const store = configureStore({
    reducer: {
        [authAPI.reducerPath]: authAPI.reducer,
        [getMeAPI.reducerPath]: getMeAPI.reducer,
        [projectAPI.reducerPath]: projectAPI.reducer,
        [technologyAPI.reducerPath]: technologyAPI.reducer,
        [facultyAPI.reducerPath]: facultyAPI.reducer,
        userState: userReducer,
    },
    devTools: process.env.NODE_ENV === 'development',
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat([
            authAPI.middleware,
            getMeAPI.middleware,
            projectAPI.middleware,
            facultyAPI.middleware,
            technologyAPI.middleware,
        ]),
});

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
