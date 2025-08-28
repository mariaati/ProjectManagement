import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../redux/api/authAPI";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function Login() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const [loginUser, { isLoading, isError, error, isSuccess }] = useLoginUserMutation();

    const onSubmit = (data) => {
        loginUser(data);
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success("You successfully logged in");
            navigate('/home');
        }

        if (isError) {
            const errorMsg = error?.data?.message || error?.data || "Login failed";
            toast.error(errorMsg);
        }
    }, [isLoading, isSuccess, isError, error, navigate]);

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Login to continue</p>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className={`form-control ${errors.username ? "is-invalid" : ""}`}
                            {...register("username", { required: "Username is required" })}
                        />
                        {errors.username && <div className="invalid-feedback">{errors.username.message}</div>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className={`form-control ${errors.password ? "is-invalid" : ""}`}
                            {...register("password", { required: "Password is required" })}
                        />
                        {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                    </div>

                    <button className="btn btn-primary w-100 auth-btn" type="submit" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <div className="auth-footer">
                    <span>Don’t have an account?</span>{" "}
                    <Link to="/register" className="auth-link">
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    );
}
