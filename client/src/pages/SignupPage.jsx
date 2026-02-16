import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import FormInput from '../components/FormInput';
import { UserPlus, Loader2 } from 'lucide-react';

/**
 * SignupPage – name, email, password, confirm password with Firebase Auth.
 */
export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Must be at least 6 characters.';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsLoading(true);
    const result = await signup(form.name, form.email, form.password);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setServerError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

            {/* Header */}
            <div className="text-center mb-8">

              <div className="w-14 h-14 bg-[#EEF3FB] rounded-xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-7 h-7 text-[#4A6FA5]" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                Create Account
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Start your personalized study journey
              </p>

            </div>

            {/* Server error */}
            {serverError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                {serverError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              <FormInput
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Alex Johnson"
                error={errors.name}
                required
              />

              <FormInput
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                error={errors.email}
                required
              />

              <FormInput
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
                required
              />

              <FormInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.confirmPassword}
                required
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#4A6FA5] text-white font-semibold rounded-xl hover:bg-[#3F5F92] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account…
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

            </form>

            {/* Footer */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#4A6FA5] font-medium hover:underline"
              >
                Log In
              </Link>
            </p>

          </div>

        </div>
      </div>
    </div>
  );
}
