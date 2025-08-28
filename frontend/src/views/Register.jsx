import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterUserMutation } from "../redux/api/authAPI";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";

export default function Register() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const [registerUser, { isLoading, isSuccess, isError, error }] = useRegisterUserMutation();

    const onSubmit = async (data) => {
        try {
            await registerUser({
                name: data.name,
                username: data.username,
                password: data.password,
                role: "student",
            }).unwrap();
        } catch {
            // handled in useEffect
        }
    };

    // Show toast and redirect after mutation state changes
    useEffect(() => {
        if (isSuccess) {
            toast.success("Registration successful! Redirecting to login...");
            setTimeout(() => navigate("/login"), 1500);
        }
        if (isError) {
            const errorMsg = error?.data?.message || "Registration failed";
            toast.error(errorMsg);
        }
    }, [isSuccess, isError, error, navigate]);

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Sign up to get started</p>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-2">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className={`form-control ${errors.name ? "is-invalid" : ""}`}
                            {...register("name", { required: "Name is required" })}
                        />
                        {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className={`form-control ${errors.username ? "is-invalid" : ""}`}
                            {...register("username", { required: "Username is required" })}
                        />
                        {errors.username && <div className="invalid-feedback">{errors.username.message}</div>}
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className={`form-control ${errors.password ? "is-invalid" : ""}`}
                            {...register("password", { required: "Password is required", minLength: 6 })}
                        />
                        {errors.password && (
                            <div className="invalid-feedback">
                                Password must be at least 6 characters
                            </div>
                        )}
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                            {...register("confirmPassword", {
                                required: "Confirm your password",
                                validate: (value) => value === watch("password") || "Passwords do not match",
                            })}
                        />
                        {errors.confirmPassword && (
                            <div className="invalid-feedback">{errors.confirmPassword.message}</div>
                        )}
                    </div>

                    <button className="btn btn-primary w-100 auth-btn" type="submit" disabled={isLoading}>
                        {isLoading ? "Registering..." : "Register"}
                    </button>
                </form>
                <div className="auth-footer">
                    <span>Already have an account?</span>{" "}
                    <Link to="/login" className="auth-link">
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
}
