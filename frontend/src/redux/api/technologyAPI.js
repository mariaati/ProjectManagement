import { createApi } from "@reduxjs/toolkit/query/react";
import defaultFetchBase from "./defaultFetchBase";

export const technologyAPI = createApi({
    reducerPath: "technologyAPI",
    baseQuery: defaultFetchBase,
    tagTypes: ["Technology"],
    endpoints: (builder) => ({
        getTechnologies: builder.query({
            query: () => ({
                url: "/technologies",
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["Technology"],
        }),

        getTechnology: builder.query({
            query: (id) => ({
                url: `/technologies/getOne/${id}`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: (result, error, id) => [{ type: "Technology", id }],
        }),

        createTechnology: builder.mutation({
            query: (technologyData) => ({
                url: "/technologies/create",
                method: "POST",
                body: technologyData,
                credentials: "include",
            }),
            invalidatesTags: ["Technology"],
        }),

        updateTechnology: builder.mutation({
            query: ({ id, ...technologyData }) => ({
                url: `/technologies/update/${id}`,
                method: "PUT",
                body: technologyData,
                credentials: "include",
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Technology", id }],
        }),

        deleteTechnology: builder.mutation({
            query: (id) => ({
                url: `/technologies/delete/${id}`,
                method: "DELETE",
                credentials: "include",
            }),
            invalidatesTags: ["Technology"],
        }),
    }),
});

export const {
    useGetTechnologiesQuery,
    useGetTechnologyQuery,
    useCreateTechnologyMutation,
    useUpdateTechnologyMutation,
    useDeleteTechnologyMutation,
} = technologyAPI;
