import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePostService } from '../context/PostContext';
import PostCard from '../ui/PostCard';
import { showError } from '../utils/toast';

function Tag() {
  const { name } = useParams();
  const { getPostsByTag } = usePostService();
  const [posts, setPosts] = useState([]);
  const [tag, setTag] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const res = await getPostsByTag(name);
        setPosts(res.posts || []);
        setTag(res.tag || { name });
      } catch (err) {
        showError('Failed to fetch posts for this tag');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [name]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-gray-100 dark:bg-[#2A3236]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">
        Posts tagged with <span className="text-indigo-600">#{tag?.name}</span>
      </h1>
      {posts?.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 italic">
          No posts for this tag yet. Be the first to create one!
        </p>
      )}
    </div>
  );
}

export default Tag;
