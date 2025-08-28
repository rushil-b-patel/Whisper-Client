import PostCard from '../ui/PostCard';
import { useNavigate } from 'react-router-dom';
import { PostCardSkeleton } from '../ui/PostCardSkeleton';
import { RefreshCw, PlusCircle } from 'lucide-react';

export default function Feed({ isLoading, error, filteredPosts, fetchPosts }) {
  const navigate = useNavigate();

  return (
    <main className="flex-1 max-w-2xl mx-auto px-2 py-4 overflow-y-auto feed-scrollbar-hidden">
      {isLoading ? (
        <div className="space-y-4 pb-20 animate-pulse">
          {Array.from({ length: 3 }).map((_, idx) => (
            <PostCardSkeleton key={idx} />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <p className="text-red-500 font-semibold mb-4">{error}</p>
          <button
            onClick={fetchPosts}
            className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:scale-105 active:scale-95 transition-all shadow"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-4 pb-20">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => <PostCard key={post._id} post={post} />)
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16">
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-base">
                Be the first to share something with the community!
              </p>
              <button
                onClick={() => navigate('/create-post')}
                className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:scale-105 active:scale-95 transition-all shadow"
              >
                <PlusCircle size={16} />
                Create Post
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
