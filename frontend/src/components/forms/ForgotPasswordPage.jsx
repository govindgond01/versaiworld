import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineMail } from 'react-icons/ai';
import bookImg from "../../assets/books-library.jpg";
import Loader from '../common/Loader';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setEmail('');
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      setError('Server error. Please try again.');
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen login-form flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="flex">
          <div className="w-full lg:w-1/2 p-4 md:p-6">
            <div className="flex flex-col justify-center h-[100%]">
              <div className="text-center mb-4 md:mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AiOutlineMail className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  Forgot Password
                </h1>
                <p className="text-gray-600 text-sm">
                  Enter your email to receive password reset instructions
                </p>
              </div>

              {message && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      placeholder="you@example.com"
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <AiOutlineMail className="w-5 h-5 text-gray-400" />
                    </div>
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
                      <Loader type="inline" size="small" className="mr-2" />
                      Sending Reset Link...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  Remember your password?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                    Sign In
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
  );
};

export default ForgotPasswordPage;
