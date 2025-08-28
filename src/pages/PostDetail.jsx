import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePostService } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import VoteBar from '../components/VoteBar';
import { EditorRenderer } from '../components/Editor';
import { Bars, Trash, Save, ChevronLeft, Share, UnSave } from '../ui/Icons';
import { showError, showSuccess } from '../utils/toast';
import CommentThread from '../components/CommentThread';

function PostDetail() {
  const { id } = useParams();
  const { getPost, deletePost, savePost } = usePostService();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await getPost(id);
        setPost(response.post);
        setComments(response.comments || []);
        setIsSaved(user?.savedPosts?.includes(response.post._id));
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchPost();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [id, getPost, user?.savedPosts]);

  const handleSavePost = async () => {
    try {
      const res = await savePost(id);
      setIsSaved(res.isSaved);
    } catch {}
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
  };

  const handleDeletePost = async () => {
    if (user?._id !== post?.user?._id) {
      showError('Unauthorized');
      return;
    }
    try {
      setIsLoading(true);
      await deletePost(localStorage.getItem('token'), id);
      navigate('/');
    } catch {
      showError('Failed to delete post');
    } finally {
      setIsLoading(false);
      setShowOptions(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex h-[90vh] justify-center items-center">
        <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!post)
    return <div className="text-center mt-20 text-gray-600 dark:text-gray-400">Post not found</div>;

  const isOwner = user?._id === post.user?._id;

  return (
    <div className="min-h-screen py-8 px-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center mb-6 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        <span>Back</span>
      </button>

      <div className="max-w-4xl mx-auto border border-gray-200 dark:border-neutral-800 p-6 sm:p-8 rounded-2xl shadow-md">
        <header className="flex items-center mb-6">
          <img
            src={post?.avatar || `https://ui-avatars.com/api/?name=${post.user.userName}`}
            className="w-12 h-12 rounded-full ring-2 ring-indigo-300 dark:ring-gray-700"
            alt="avatar"
          />
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {post.user.userName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {post.user.department || 'General'} • {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
          {isOwner && (
            <div className="ml-auto relative" ref={dropdownRef}>
              <button
                onClick={() => setShowOptions((prev) => !prev)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#1f2428] rounded-full"
              >
                <Bars className="w-5 h-5" />
              </button>
              {showOptions && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black overflow-hidden z-50">
                  <button
                    onClick={handleDeletePost}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-600/20 transition-colors w-full"
                  >
                    <Trash className="w-4 h-4" />
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h1>

        {post.image && (
          <div className="mb-6 rounded-xl overflow-hidden">
            <img src={post.image} alt="Post" className="w-full object-cover max-h-[500px]" />
          </div>
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <button
                key={tag._id}
                onClick={() => navigate(`/tags/${encodeURIComponent(tag.name)}`)}
                className="px-3 py-1 text-xs rounded-full bg-indigo-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100 hover:bg-indigo-200 dark:hover:bg-gray-600 transition"
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}

        <div className="mb-6 text-gray-800 dark:text-gray-200">
          <EditorRenderer data={post.description} />
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center border-t pt-6 dark:border-gray-700">
          <VoteBar
            postId={post._id}
            initialVotes={post.upVotes - post.downVotes}
            initialUpVoted={post.upVotedUsers.includes(user?._id)}
            initialDownVoted={post.downVotedUsers.includes(user?._id)}
          />
          <div className="flex gap-4">
            <button
              onClick={handleSavePost}
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-200 hover:text-black dark:hover:text-white transition"
            >
              {isSaved ? <UnSave className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {isSaved ? 'Unsave' : 'Save'}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-200 hover:text-black dark:hover:text-white transition"
            >
              <Share className="w-5 h-5" /> Share
            </button>
          </div>
        </div>

        <CommentThread post={post} comments={comments} />
      </div>
    </div>
  );
}

export default PostDetail;
