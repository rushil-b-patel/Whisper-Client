import { Link, useNavigate } from 'react-router-dom';
import { WhisperLogo } from './WhisperLogo';
import User from '../ui/User';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { Search } from '../ui/Icons';
import { usePostService } from '../context/PostContext';

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { searchPosts } = usePostService();

  const [showSearch, setShowSearch] = useState(false);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        desktopSearchRef.current?.contains(event.target) ||
        mobileSearchRef.current?.contains(event.target) ||
        event.target.closest('.search-dropdown')
      ) {
        return;
      }
      setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const controller = new AbortController();

    const fetchResults = async () => {
      try {
        const posts = await searchPosts(query);
        if (!controller.signal.aborted) {
          setResults(posts);
          console.log(posts);
          setShowDropdown(true);
        }
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
          setShowDropdown(false);
        }
      }
    };

    const timeout = setTimeout(fetchResults, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowDropdown(false);
      setShowSearch(false);
    }
  };

  return (
    <nav className="flex items-center justify-between h-16 px-4 md:px-10 border-b dark:border-[#2A3236] border-gray-200 relative">
      <div className="flex items-center space-x-4">
        <WhisperLogo />

        <div className="hidden lg:block w-64 relative" ref={desktopSearchRef}>
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-[#2A3236]"
          />
          {showDropdown && results.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#2A3236] 
                    rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 
                    max-h-72 overflow-y-auto z-50 search-dropdown"
            >
              <ul>
                {results.map((post) => (
                  <li key={post._id}>
                    <Link
                      to={`/post/${post._id}`}
                      className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#1f2428]"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="text-sm font-medium">
                        {post.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {post.tags?.map((tag) => `#${tag.name}`).join(' ')}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 lg:space-x-4">
        <div ref={mobileSearchRef} className="relative block md:hidden">
          {!showSearch && (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#1f2428] transition"
              aria-label="Search"
            >
              <Search />
            </button>
          )}
          {showSearch && (
            <>
              <input
                type="text"
                placeholder="Search..."
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="right-0 w-48 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-[#2A3236] border border-gray-300 dark:border-slate-700 transition"
              />
              {showDropdown && results.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#2A3236] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-72 overflow-y-auto z-50 search-dropdown">
                  <ul>
                    {results.map((post) => (
                      <li key={post._id}>
                        <Link
                          to={`/post/${post._id}`}
                          className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#1f2428]"
                          onClick={() => {
                            setShowDropdown(false);
                            setShowSearch(false);
                          }}
                        >
                          <div className="text-sm font-medium">
                            {post.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {post.tags?.map((tag) => `#${tag.name}`).join(' ')}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        <div className="hidden md:flex space-x-2">
          <Link
            to="/create-post"
            className="px-3 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 dark:hover:bg-[#1f2428] transition"
          >
            Create
          </Link>
          <Link
            to="/departments"
            className="px-3 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 dark:hover:bg-[#1f2428] transition"
          >
            Departments
          </Link>
        </div>

        {user ? (
          <User />
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/login')}
              className="hidden lg:block text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-[#2A3236] px-4 py-2 rounded transition"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="relative inline-block px-4 py-2 font-medium group"
            >
              <span className="absolute inset-0 bg-black translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition duration-200 ease-in-out"></span>
              <span className="absolute inset-0 bg-white border-2 border-black group-hover:bg-black transition duration-200 ease-in-out"></span>
              <span className="relative text-black group-hover:text-white transition duration-200 ease-in-out">
                Sign Up
              </span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
