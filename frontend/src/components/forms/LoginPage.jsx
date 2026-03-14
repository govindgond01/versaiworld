import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import bookImg from "../../assets/books-library.jpg";
import "./style.css";

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:5000/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        const userRole = data.user.userType || data.user.role;
        localStorage.setItem("role", userRole);
        
        if (userRole === "student" && data.user.studentCategory) {
          localStorage.setItem("studentCategory", data.user.studentCategory);
        }
        
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", data.user.name);
        localStorage.setItem("userId", data.user.userId || data.user._id);

        if (userRole === "admin") {
          window.location.href = "/admin-dashboard";
        } else if (userRole === "staff") {
          window.location.href = "/staff-dashboard";
        } else if (userRole === "student") {
          if (data.user.studentCategory === "academy") {
            window.location.href = "/academy-dashboard";
          } else if (data.user.studentCategory === "library") {
            window.location.href = "/library-dashboard";
          } else {
            window.location.href = "/login";
          }
        }
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (error) {
      setError("Server error. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen lg:h-screen login-form flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="flex">
            <div className="w-full lg:w-1/2 p-4 md:p-5">
              <div className="flex flex-col justify-center h-[100%]">
                <div className="text-center mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    Versai Academy Library
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Sign in to your Library CRM account
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        placeholder="you@example.com"
                        required
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12 transition-colors"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <AiOutlineEyeInvisible className="w-5 h-5" />
                        ) : (
                          <AiOutlineEye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium text-white text-sm transition-all duration-300 ${
                      loading
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                <div className="text-center mt-6 pt-6 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block lg:w-1/2">
              <div className="h-full">
                <img className="h-full w-full object-cover" src={bookImg} alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;