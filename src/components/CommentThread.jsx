import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePostService } from '../context/PostContext';
import { CommentItem } from './CommentItem';

export default function CommentThread({ post, comments: initialComments = [] }) {
  const [comments, setComments] = useState(Array.isArray(initialComments) ? initialComments : []);
  const [newComment, setNewComment] = useState('');
  const { addComment } = usePostService();
  const { user } = useAuth();

  useEffect(() => {
    setComments(Array.isArray(initialComments) ? initialComments : []);
  }, [initialComments]);

  const handleAdd = useCallback(
    async (parentId, text) => {
      if (!post?._id) throw new Error('Post missing');
      const resp = await addComment(post._id, text, parentId);
      if (resp?.success) {
        setComments((c) => [{ ...resp.comment }, ...c]);
      } else {
        throw new Error(resp?.message || 'Failed to add comment');
      }
    },
    [addComment, post?._id]
  );

  const handleDelete = useCallback((id) => {
    setComments((c) => c.filter((x) => x._id !== id));
  }, []);

  const onSubmitTop = async (e) => {
    e.preventDefault();
    const text = newComment.trim();
    if (!text) return;
    try {
      await handleAdd(null, text);
      setNewComment('');
    } catch (err) {}
  };

  if (!post) return null;

  return post.allowComments ? (
    <div className="space-y-6 mt-8 transition-colors duration-200">
      {/* New Comment */}
      <form onSubmit={onSubmitTop} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          className="w-full p-3 rounded border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#131619] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none transition"
          placeholder={user ? 'Leave a comment…' : 'Log in to comment'}
          disabled={!user}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim() || !user}
            className="px-4 py-1 rounded bg-black text-white dark:bg-white dark:text-black disabled:opacity-50 transition hover:opacity-90"
          >
            Comment
          </button>
        </div>
      </form>

      {/* Comment List */}
      {comments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No comments yet…</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              postId={post._id}
              onAddReply={handleAdd}
              onDeleteComment={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  ) : (
    <p className="text-gray-500 dark:text-gray-400 text-sm mt-8">
      Comments are disabled for this post.
    </p>
  );
}
