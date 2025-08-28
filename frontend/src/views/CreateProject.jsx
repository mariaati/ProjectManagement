import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateProjectMutation } from "../redux/api/projectAPI";
import { useGetTechnologiesQuery } from "../redux/api/technologyAPI";
import { useGetFacultiesQuery } from "../redux/api/facultyAPI";

const CreateProject = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [createProject, { isLoading, isSuccess, error }] = useCreateProjectMutation();

  // Fetch dropdown data
  const { data: technologiesList } = useGetTechnologiesQuery();
  const { data: facultiesList } = useGetFacultiesQuery();

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Append text fields
      formData.append("title", data.title);
      formData.append("main_topic", data.main_topic || "");
      formData.append("description", data.description);
      formData.append("submission_year", data.submission_year);
      formData.append("study_track", data.study_track || "");
      formData.append("faculty_id", data.faculty_id || "");
      formData.append("github_link", data.github_link || "");
      formData.append("live_link", data.live_link || "");
      formData.append("youtube_link", data.youtube_link || "");
      formData.append("document_link", data.document_link || "");

      // Append technologies (IDs as array)
      if (data.technologies && data.technologies.length > 0) {
        data.technologies.forEach((techId) => {
          formData.append("technologies[]", techId);
        });
      }

      // Append media files
      if (data.media && data.media.length > 0) {
        Array.from(data.media).forEach((file) => {
          formData.append("media", file);
        });
      }

      await createProject(formData).unwrap();
      reset();
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  return (
    <div className="container main-board">
      <div className="card shadow-lg border-0">
        <div className="card-header bg-white text-dark">
          <h4 className="m-2">Create Project</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} className="row g-3" encType="multipart/form-data">

            {/* Title */}
            <div className="col-md-6">
              <label className="form-label">Title</label>
              <input
                type="text"
                className={`form-control ${errors.title ? "is-invalid" : ""}`}
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
            </div>

            {/* Main Topic */}
            <div className="col-md-6">
              <label className="form-label">Main Topic</label>
              <input type="text" className="form-control" {...register("main_topic")} />
            </div>

            {/* Description */}
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                className={`form-control ${errors.description ? "is-invalid" : ""}`}
                rows="3"
                {...register("description", { required: "Description is required" })}
              ></textarea>
              {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
            </div>

            {/* Submission Year */}
            <div className="col-md-6">
              <label className="form-label">Submission Year</label>
              <input
                type="number"
                className={`form-control ${errors.submission_year ? "is-invalid" : ""}`}
                {...register("submission_year", {
                  required: "Submission year is required",
                  min: { value: 1900, message: "Year must be at least 1900" },
                  max: { value: new Date().getFullYear(), message: `Year cannot exceed ${new Date().getFullYear()}` }
                })}
              />
              {errors.submission_year && <div className="invalid-feedback">{errors.submission_year.message}</div>}
            </div>

            {/* Study Track */}
            <div className="col-md-6">
              <label className="form-label">Study Track</label>
              <input type="text" className="form-control" {...register("study_track")} />
            </div>

            {/* Faculty */}
            <div className="col-md-6">
              <label className="form-label">Faculty</label>
              <select className="form-control" {...register("faculty_id")}>
                <option value="">Select Faculty</option>
                {facultiesList?.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                ))}
              </select>
            </div>

            {/* GitHub Link */}
            <div className="col-md-6">
              <label className="form-label">GitHub Link</label>
              <input type="url" className="form-control" {...register("github_link")} />
            </div>

            {/* Live Link */}
            <div className="col-md-6">
              <label className="form-label">Live Link</label>
              <input type="url" className="form-control" {...register("live_link")} />
            </div>

            {/* YouTube Link */}
            <div className="col-md-6">
              <label className="form-label">YouTube Link</label>
              <input type="url" className="form-control" {...register("youtube_link")} />
            </div>

            {/* Document Link */}
            <div className="col-md-6">
              <label className="form-label">Document Link</label>
              <input type="url" className="form-control" {...register("document_link")} />
            </div>

            {/* Media Upload */}
            <div className="col-md-6">
              <label className="form-label">Upload Media</label>
              <input
                type="file"
                className="form-control"
                {...register("media")}
                accept="image/*,video/*"
                multiple
              />
            </div>

            {/* Technologies */}
            <div className="col-md-6">
              <label className="form-label">Technologies</label>
              <select
                className="form-control"
                {...register("technologies")}
                multiple
              >
                {technologiesList?.map((tech) => (
                  <option key={tech.id} value={tech.id}>{tech.name}</option>
                ))}
              </select>
              <small className="text-muted">Hold CTRL (Windows) or CMD (Mac) to select multiple</small>
            </div>

            {/* Submit */}
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-success px-4" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>

          {isSuccess && <div className="alert alert-success mt-3">Project created successfully!</div>}
          {error && <div className="alert alert-danger mt-3">Error: {error.data?.message || error.message}</div>}
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
