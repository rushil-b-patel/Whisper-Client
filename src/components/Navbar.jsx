import { Link, useNavigate } from 'react-router-dom';
import { WhisperLogo } from './WhisperLogo';
import User from '../ui/User';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { Search } from '../ui/Icons';
import { usePostService } from '../context/PostContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { searchPosts } = usePostService();

  const desktopSearchRef = useRef(null);
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const abortRef = useRef();

  useEffect(() => {
    const onDoc = (e) => {
      if (!desktopSearchRef.current) return;
      if (!desktopSearchRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const handle = setTimeout(async () => {
      try {
        const posts = await searchPosts(q, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setResults(Array.isArray(posts) ? posts : []);
          setOpen(true);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setResults([]);
          setOpen(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(handle);
      controller.abort();
    };
  }, [query]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      const trimmed = query.trim();
      if (trimmed.length === 0) return;
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <nav className="flex items-center justify-between h-16 px-4 md:px-8 border-b border-gray-200 dark:border-neutral-800">
      <div className="flex items-center gap-4">
        <WhisperLogo />

        <div ref={desktopSearchRef} className="relative hidden lg:block w-[320px]">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 transition">
            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input
              ref={inputRef}
              aria-label="Search posts"
              className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
              placeholder="Search posts, tags or authors"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
            />
            {query && (
              <button
                aria-label="Clear search"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setOpen(false);
                }}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            )}
          </div>

          {open && (
            <div
              role="listbox"
              aria-label="Search results"
              className="absolute left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-72 overflow-y-auto z-50"
            >
              {results.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">No results</div>
              ) : (
                <ul>
                  {results.map((p) => (
                    <li key={p._id} role="option">
                      <Link
                        to={`/post/${p._id}`}
                        onClick={() => {
                          setOpen(false);
                          setQuery('');
                        }}
                        className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                      >
                        <div className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                          {p.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {p.tags?.map((t) => `#${t.name}`).join(' ') || p.user?.userName}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex gap-2">
          <Link
            to="/create-post"
            className="px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
          >
            Create
          </Link>
          <Link
            to="/departments"
            className="px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
          >
            Departments
          </Link>
        </div>

        {user ? (
          <User />
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="hidden lg:inline px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-3 py-1 rounded-md text-sm font-semibold bg-black text-white dark:bg-white dark:text-black transition hover:opacity-90"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
