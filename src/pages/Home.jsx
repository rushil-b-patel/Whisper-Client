import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { usePostService } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { Fire, Sparkles, Clock } from '../ui/Icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, Chat, Inbox, Create, Departments } from '../ui/Icons';
import LeftLayout from './LeftLayout';
import RightLayout from './RightLayout';
import Feed from './Feed';

function Home() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('trending');
  const [departments, setDepartments] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [departmentsError, setDepartmentsError] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [activeDepartment, setActiveDepartment] = useState(null);

  const isPostsFetchingRef = useRef(false);
  const isDepartmentsFetchingRef = useRef(false);
  const isStatsFetchingRef = useRef(false);
  const initialLoadRef = useRef(false);

  const { getAllPosts, getDepartments, getUserStats } = usePostService();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchPosts = useCallback(async () => {
    if (isPostsFetchingRef.current) return;
    isPostsFetchingRef.current = true;
    try {
      const response = await getAllPosts();
      setPosts(response.posts || []);
      setError(null);
    } catch (err) {
      setError('Failed to load posts. Try again later.');
    } finally {
      setIsLoading(false);
      isPostsFetchingRef.current = false;
    }
  }, [getAllPosts]);

  const _fetchDepartments = useCallback(async () => {
    if (isDepartmentsFetchingRef.current) return;
    isDepartmentsFetchingRef.current = true;
    try {
      setDepartmentsLoading(true);
      setDepartmentsError(null);
      const response = await getDepartments();
      if (response.departments?.length > 0) {
        setDepartments(response.departments);
      } else {
        setDepartments([]);
        setDepartmentsError('No departments found');
      }
    } catch (err) {
      setDepartmentsError('Failed to load departments');
      setDepartments([]);
    } finally {
      setDepartmentsLoading(false);
      isDepartmentsFetchingRef.current = false;
    }
  }, [getDepartments]);

  const fetchUserStats = useCallback(async () => {
    if (isStatsFetchingRef.current) return;

    if (!user) {
      setStatsLoading(false);
      setUserStats(null);
      setStatsError(null);
      return;
    }

    isStatsFetchingRef.current = true;
    try {
      setStatsLoading(true);
      setStatsError(null);
      const token = localStorage.getItem('token');
      if (token) {
        const response = await getUserStats(token);
        if (response.stats) {
          setUserStats(response.stats);
        } else {
          setUserStats(null);
          setStatsError('No user statistics available');
        }
      } else {
        setStatsError('Authentication required');
      }
    } catch (err) {
      setStatsError('Failed to load user statistics');
      setUserStats(null);
    } finally {
      setStatsLoading(false);
      isStatsFetchingRef.current = false;
    }
  }, [user, getUserStats]);

  useEffect(() => {
    if (initialLoadRef.current) {
      if (user) fetchUserStats();
      return;
    }

    initialLoadRef.current = true;
    fetchPosts();
    _fetchDepartments();
    if (user) fetchUserStats();
  }, [user]);

  const filteredPosts = useMemo(() => {
    if (!posts?.length) return [];

    const safeUpvotes = (p) => Number(p.upVotes || 0);
    const safeDownvotes = (p) => Number(p.downVotes || 0);
    const voteScore = (p) => safeUpvotes(p) - safeDownvotes(p);

    let filtered = [...posts];
    if (activeDepartment) {
      filtered = filtered.filter((post) => post.user?.department === activeDepartment);
    }

    switch (activeFilter) {
      case 'trending':
        return filtered.sort((a, b) => voteScore(b) - voteScore(a));
      case 'new':
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'popular':
        return filtered.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
      default:
        return filtered;
    }
  }, [posts, activeFilter, activeDepartment]);

  const filters = useMemo(
    () => [
      { id: 'trending', label: 'Trending', icon: <Fire className="w-5 h-5" /> },
      { id: 'new', label: 'New', icon: <Clock className="w-5 h-5" /> },
      { id: 'popular', label: 'Popular', icon: <Sparkles className="w-5 h-5" /> },
    ],
    []
  );

  const handleFilterChange = useCallback((filterId) => {
    setActiveFilter(filterId);
    setShowMobileFilter(false);
  }, []);

  const handleRefresh = useCallback(() => {
    if (
      isPostsFetchingRef.current ||
      isDepartmentsFetchingRef.current ||
      isStatsFetchingRef.current
    )
      return;

    isPostsFetchingRef.current = false;
    isDepartmentsFetchingRef.current = false;
    isStatsFetchingRef.current = false;

    fetchPosts();
    _fetchDepartments();
    if (user) fetchUserStats();
  }, [fetchPosts, _fetchDepartments, fetchUserStats, user]);

  return (
    <div className="min-h-screen overflow-y-auto bg-bg text-text transition-colors duration-300">
      {showMobileFilter && (
        <div className="fixed top-16 left-0 w-full z-40 border-b border-gray-200 dark:border-[#2A2B30] md:hidden shadow-sm animate-slide-down bg-white dark:bg-[#131619]">
          {filters.map(({ id, label }) => (
            <button
              key={id}
              className={`w-full flex items-center px-4 py-3 text-left transition-all duration-200 hover:scale-105 ${
                activeFilter === id
                  ? 'text-black dark:text-white bg-gray-100 dark:bg-gray-800 font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1f2428]'
              }`}
              onClick={() => handleFilterChange(id)}
            >
              {label}
            </button>
          ))}

          <div className="border-t border-gray-200 dark:border-gray-700 mt-2">
            {departmentsLoading ? (
              <div className="p-4 animate-pulse text-sm text-gray-500">Loading departments…</div>
            ) : departmentsError ? (
              <div className="p-4 text-sm text-red-600 dark:text-red-400">{departmentsError}</div>
            ) : (
              departments.map((dep) => (
                <button
                  key={dep._id}
                  onClick={() => {
                    setActiveDepartment(dep.name);
                    setShowMobileFilter(false);
                  }}
                  className={`w-full px-4 py-2 text-left transition ${
                    activeDepartment === dep.name
                      ? 'bg-gray-100 dark:bg-gray-800 font-medium text-black dark:text-white'
                      : 'hover:bg-gray-50 dark:hover:bg-[#1f2428] text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {dep.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row h-full gap-0 md:gap-6 flex-1">
        <LeftLayout
          activeFilter={activeFilter}
          handleFilterChange={handleFilterChange}
          filters={filters}
          departments={departments}
          departmentsLoading={departmentsLoading}
          departmentsError={departmentsError}
          fetchDepartments={_fetchDepartments}
          setActiveDepartment={setActiveDepartment}
          activeDepartment={activeDepartment}
        />

        <Feed
          isLoading={isLoading}
          error={error}
          filteredPosts={filteredPosts}
          fetchPosts={fetchPosts}
        />

        <RightLayout
          user={user}
          statsLoading={statsLoading}
          statsError={statsError}
          userStats={userStats}
          fetchUserStats={fetchUserStats}
        />
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#131619] border-t border-gray-200 dark:border-[#2A2B30] flex justify-between items-center px-2 py-1 md:hidden shadow-md">
        {[
          { id: '/', icon: <HomeIcon />, label: 'Home' },
          { id: '/departments', icon: <Departments />, label: 'Departments' },
          { id: '/create-post', icon: <Create />, label: 'Create' },
          { id: '/chat', icon: <Chat />, label: 'Chat' },
          { id: '/inbox', icon: <Inbox />, label: 'Inbox' },
        ].map(({ id, icon, label }) => {
          const isActive = location.pathname === id;
          return (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={`flex flex-col items-center flex-1 py-2 transition-all duration-200 hover:scale-110 ${
                isActive
                  ? 'text-black dark:text-white font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="w-6 h-6">{icon}</span>
              <span className="text-xs">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default Home;
