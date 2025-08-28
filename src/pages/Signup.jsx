import { useEffect, useState } from 'react';
import { Eye, EyeOff } from '../ui/Icons';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signup, googleSignup, isLoading, error, setError } = useAuth();

  useEffect(() => {
    return () => setError(null);
  }, [setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(userName, email, password);
  };

  const handleGoogleSignup = async (response) => {
    try {
      await googleSignup(response);
    } catch {
      setError('Google signup failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4em)] px-4 py-12">
      <div className="w-full max-w-md border border-gray-200 dark:border-[#2A2B30] rounded-2xl p-8 dark:bg-[#131619] shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
        {error && (
          <div className="mb-4 p-3 text-sm rounded-md bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              placeholder="Username"
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-[#2A3236] dark:text-[#eef1f3] border border-gray-300 dark:border-[#2A2B30] placeholder-gray-400 transition"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-[#2A3236] dark:text-[#eef1f3] border border-gray-300 dark:border-[#2A2B30] placeholder-gray-400 focus:outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full px-3 py-2 pr-10 rounded-md bg-white dark:bg-[#2A3236] dark:text-[#eef1f3] border border-gray-300 dark:border-[#2A2B30] placeholder-gray-400 focus:outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-black hover:bg-white hover:text-black border-2 border-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white transition duration-300 ease-in-out"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-sm text-center mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Log in
          </Link>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-[#131619] text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSignup}
            onError={() => setError('Google signup failed.')}
            useOneTap
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;
