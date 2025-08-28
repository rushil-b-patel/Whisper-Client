import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="h-[calc(100vh-4em)] flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white">404</h1>
      <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 text-center">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-2.5 rounded-lg font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
      >
        Go Back Home
      </Link>
    </main>
  );
}
