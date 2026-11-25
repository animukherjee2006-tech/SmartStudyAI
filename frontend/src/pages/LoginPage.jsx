import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { authApi } from '../services/api';

function LoginPage() {
  const { login } = useAuth();
  const notify = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot / Reset Password flow
  const [resetMode, setResetMode] = useState(false);
  const [resetStep, setResetStep] = useState('request'); // 'request' | 'confirm'
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password, rememberMe });
      notify.success('Welcome back to StudyBuddy AI.');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    if (!resetEmail.trim()) {
      setError('Please enter your account email.');
      return;
    }
    setResetLoading(true);
    try {
      const res = await authApi.forgotPassword(resetEmail.trim());
      notify.info(res.message);
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
      setResetStep('confirm');
    } catch (err) {
      setError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setError('');
    if (!resetToken.trim() || newPassword.length < 8) {
      setError('Valid reset token and a new password (min 8 chars) are required.');
      return;
    }
    setResetLoading(true);
    try {
      const res = await authApi.resetPassword({
        token: resetToken.trim(),
        password: newPassword,
      });
      notify.success(res.message);
      setResetMode(false);
      setResetStep('request');
      setNewPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EC] flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#294C73] hover:text-[#172B4D] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white border border-[#E5E1D8] rounded-xl shadow-sm overflow-hidden">
          <div className="bg-[#172B4D] px-6 py-5 text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#10213A] border border-[#C49A45]/50 flex items-center justify-center text-[#C49A45]">
              {resetMode ? <KeyRound className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold">
                {resetMode ? 'Reset Password' : 'Student Sign In'}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                {resetMode
                  ? 'Recover access to your StudyBuddy AI account'
                  : 'Access your academic notes, quizzes, and materials'}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            {error && (
              <div className="mb-4 p-3 rounded-md bg-[#B94A48]/10 border border-[#B94A48]/30 text-sm text-[#B94A48]">
                {error}
              </div>
            )}

            {!resetMode ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#172B4D] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E1D8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#294C73]/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#172B4D] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-[#E5E1D8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#294C73]/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#172B4D]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-[#4B5563] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#E5E1D8] text-[#172B4D] focus:ring-[#294C73]"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setResetMode(true);
                    }}
                    className="font-medium text-[#294C73] hover:text-[#172B4D]"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-md bg-[#172B4D] hover:bg-[#10213A] disabled:opacity-60 text-white text-sm font-semibold transition"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            ) : resetStep === 'request' ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#172B4D] mb-1.5">
                    Account Email
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@university.edu"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E1D8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#294C73]/40"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-2.5 px-4 rounded-md bg-[#172B4D] hover:bg-[#10213A] disabled:opacity-60 text-white text-sm font-semibold transition"
                >
                  {resetLoading ? 'Sending...' : 'Request Reset Token'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(false);
                    setError('');
                  }}
                  className="w-full text-center text-sm text-[#6B7280] hover:text-[#172B4D]"
                >
                  Back to Sign In
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#172B4D] mb-1.5">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste reset token"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E1D8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#294C73]/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#172B4D] mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars with letters & numbers"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E1D8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#294C73]/40"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-2.5 px-4 rounded-md bg-[#172B4D] hover:bg-[#10213A] disabled:opacity-60 text-white text-sm font-semibold transition"
                >
                  {resetLoading ? 'Updating...' : 'Reset Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(false);
                    setResetStep('request');
                    setError('');
                  }}
                  className="w-full text-center text-sm text-[#6B7280] hover:text-[#172B4D]"
                >
                  Cancel
                </button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-[#E5E1D8] text-center text-sm text-[#6B7280]">
              New to StudyBuddy AI?{' '}
              <Link to="/register" className="font-semibold text-[#172B4D] hover:text-[#294C73]">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
