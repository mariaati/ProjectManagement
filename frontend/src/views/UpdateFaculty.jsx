import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useGetFacultyQuery, useUpdateFacultyMutation } from "../redux/api/facultyAPI";
import { useParams } from "react-router-dom";

const UpdateFaculty = () => {
    const { id } = useParams();
    const { data, isLoading, isError, refetch } = useGetFacultyQuery(id);
    const [updateFaculty, { isLoading: isUpdating, isSuccess, error }] = useUpdateFacultyMutation();

    useEffect(() => {
        refetch();
    }, [refetch]);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        if (data) {
            reset(data);
        }
    }, [data, reset]);

    const onSubmit = async (formData) => {
        try {
            await updateFaculty({ id, ...formData }).unwrap();
        } catch (err) {
            console.error("Failed to update faculty:", err);
        }
    };

    if (isLoading) return <p className="m-4">Loading faculty...</p>;
    if (isError) return <p className="m-4 text-danger">Failed to load faculty.</p>;

    return (
        <div className="container main-board">
            <div className="card shadow">
                <div className="card-header bg-white text-dark">
                    <h4 className="m-2">Update Faculty</h4>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit(onSubmit)} className="row g-3">

                        <div className="col-md-6">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                {...register("name", { required: "Name is required" })}
                            />
                            {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                        </div>

                        <div className="col-12">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                {...register("description")}
                            ></textarea>
                        </div>

                        <div className="col-12 text-end">
                            <button type="submit" className="btn btn-success px-4" disabled={isUpdating}>
                                {isUpdating ? "Updating..." : "Update Faculty"}
                            </button>
                        </div>
                    </form>

                    {isSuccess && <div className="alert alert-success mt-3">Faculty updated successfully!</div>}
                    {error && <div className="alert alert-danger mt-3">Error: {error.data?.message || error.message}</div>}
                </div>
            </div>
        </div>
    );
};

export default UpdateFaculty;
