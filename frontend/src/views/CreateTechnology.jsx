import React from "react";
import { useForm } from "react-hook-form";
import { useCreateTechnologyMutation } from "../redux/api/technologyAPI";

const CreateTechnology = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [createTechnology, { isLoading, isSuccess, error }] = useCreateTechnologyMutation();

  const onSubmit = async (data) => {
    try {
      await createTechnology(data).unwrap();
      reset();
    } catch (err) {
      console.error("Failed to create technology:", err);
    }
  };

  return (
    <div className="container main-board">
      <div className="card shadow">
        <div className="card-header bg-white text-dark">
          <h4 className="m-2">Create Technology</h4>
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
              <button type="submit" className="btn btn-success px-4" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Technology"}
              </button>
            </div>
          </form>

          {isSuccess && <div className="alert alert-success mt-3">Technology created successfully!</div>}
          {error && <div className="alert alert-danger mt-3">Error: {error.data?.message || error.message}</div>}
        </div>
      </div>
    </div>
  );
};

export default CreateTechnology;
