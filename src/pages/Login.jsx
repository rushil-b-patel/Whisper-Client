import { useState } from 'react';
import { Eye, EyeOff } from '../ui/Icons';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const { login, googleLogin, isLoading, setIsLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your credentials');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await login(identifier.trim(), password);
      const user = response?.user;
      if (user) {
        navigate(user.isVerified ? '/' : '/verify-email');
      } else {
        setError(response?.message || 'Login failed');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Login failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async (credentialResponse) => {
    try {
      setIsLoading(true);
      await googleLogin(credentialResponse);
      navigate('/');
    } catch (err) {
      setError('Google login failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4em)] px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-md border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0d0f12]">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
          Log In
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Username or Email
            </label>
            <input
              id="identifier"
              type="text"
              placeholder="example@mail.com"
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#131619] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full px-3 py-2 pr-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#131619] text-gray-900 dark:text-gray-100 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div role="alert" className="text-sm font-medium text-rose-600 dark:text-rose-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-black hover:bg-white hover:text-black border-2 border-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white transition duration-300 ease-in-out"
          >
            {isLoading ? 'Logging in…' : 'Sign In'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-[#0d0f12] px-2 text-sm text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogle} onError={() => setError('Google login failed')} />
          </div>

          <div className="text-sm text-center mt-6 text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
