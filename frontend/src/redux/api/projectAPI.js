import { createApi } from "@reduxjs/toolkit/query/react";
import defaultFetchBase from "./defaultFetchBase";

export const projectAPI = createApi({
    reducerPath: "projectAPI",
    baseQuery: defaultFetchBase,
    tagTypes: ["Project"],
    endpoints: (builder) => ({
        getProjects: builder.query({
            query: () => ({
                url: "/projects",
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["Project"],
        }),

        getProject: builder.query({
            query: (id) => ({
                url: `/projects/getOne/${id}`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: (result, error, id) => [{ type: "Project", id }],
        }),

        createProject: builder.mutation({
            query: (projectData) => ({
                url: "/projects/create",
                method: "POST",
                body: projectData,
                credentials: "include",
            }),
            invalidatesTags: ["Project"],
        }),

        updateProject: builder.mutation({
            query: ({ id, formData  }) => ({
                url: `/projects/update/${id}`,
                method: "PUT",
                body: formData,
                credentials: "include",
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Project", id }],
        }),

        deleteProject: builder.mutation({
            query: (id) => ({
                url: `/projects/delete/${id}`,
                method: "DELETE",
                credentials: "include",
            }),
            invalidatesTags: ["Project"],
        }),
    }),
});

export const {
    useGetProjectsQuery,
    useGetProjectQuery,
    useCreateProjectMutation,
    useUpdateProjectMutation,
    useDeleteProjectMutation,
} = projectAPI;
