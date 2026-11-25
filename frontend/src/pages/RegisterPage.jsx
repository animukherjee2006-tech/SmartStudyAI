import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function RegisterPage() {
  const { register } = useAuth();
  const notify = useNotification();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasMinLength = form.password.length >= 8;
  const hasLetterAndNumber = /[A-Za-z]/.test(form.password) && /\d/.test(form.password);
  const passwordsMatch = form.password.length > 0 && form.password === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.name.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!hasMinLength || !hasLetterAndNumber) {
      setError('Password must be at least 8 characters and include both letters and numbers.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      notify.success('Account created! Welcome to StudyBuddy AI.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
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
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold">Create Student Account</h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Start organizing your notes, quizzes, and study materials
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            {error && (
              <div className="mb-4 p-3 rounded-md bg-[#B94A48]/10 border border-[#B94A48]/30 text-sm text-[#B94A48]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#172B4D] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Aarav Mehta"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E1D8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#294C73]/40"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#172B4D] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="At least 8 characters"
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

                <div className="mt-2 space-y-1 text-xs">
                  <p className={`flex items-center gap-1.5 ${hasMinLength ? 'text-[#39765B]' : 'text-[#6B7280]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    At least 8 characters
                  </p>
                  <p className={`flex items-center gap-1.5 ${hasLetterAndNumber ? 'text-[#39765B]' : 'text-[#6B7280]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Includes letters and numbers
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#172B4D] mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Re-enter your password"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E1D8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#294C73]/40"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-md bg-[#172B4D] hover:bg-[#10213A] disabled:opacity-60 text-white text-sm font-semibold transition"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#E5E1D8] text-center text-sm text-[#6B7280]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#172B4D] hover:text-[#294C73]">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
