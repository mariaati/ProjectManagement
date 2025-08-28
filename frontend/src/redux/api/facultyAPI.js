import { createApi } from "@reduxjs/toolkit/query/react";
import defaultFetchBase from "./defaultFetchBase";

export const facultyAPI = createApi({
    reducerPath: "facultyAPI",
    baseQuery: defaultFetchBase,
    tagTypes: ["Faculty"],
    endpoints: (builder) => ({
        getFaculties: builder.query({
            query: () => ({
                url: "/faculties",
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["Faculty"],
        }),

        getFaculty: builder.query({
            query: (id) => ({
                url: `/faculties/getOne/${id}`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: (result, error, id) => [{ type: "Faculty", id }],
        }),

        createFaculty: builder.mutation({
            query: (facultyData) => ({
                url: "/faculties/create",
                method: "POST",
                body: facultyData,
                credentials: "include",
            }),
            invalidatesTags: ["Faculty"],
        }),

        updateFaculty: builder.mutation({
            query: ({ id, ...facultyData }) => ({
                url: `/faculties/update/${id}`,
                method: "PUT",
                body: facultyData,
                credentials: "include",
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Faculty", id }],
        }),

        deleteFaculty: builder.mutation({
            query: (id) => ({
                url: `/faculties/delete/${id}`,
                method: "DELETE",
                credentials: "include",
            }),
            invalidatesTags: ["Faculty"],
        }),
    }),
});

export const {
    useGetFacultiesQuery,
    useGetFacultyQuery,
    useCreateFacultyMutation,
    useUpdateFacultyMutation,
    useDeleteFacultyMutation,
} = facultyAPI;
