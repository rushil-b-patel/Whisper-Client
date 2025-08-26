import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <main className="h-[calc(100vh-4em)] flex flex-col justify-center items-center">
      <h1 className="font-bold text-black dark:text-white text-center text-5xl">404</h1>
      <p>
        <span className="mt-2">
          The page you are looking for does not exist.
        </span>
      </p>
      <Link
        to="/"
        className="text-center font-semibold mt-5 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-300 dark:hover:bg-[#1f2428] py-2 px-5 rounded-lg"
      >
        <span>Go to Home</span>
      </Link>
    </main>
  );
};

export default NotFound;
