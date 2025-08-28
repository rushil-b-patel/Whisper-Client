import { useState } from 'react';
import { Trash, Reply } from '../ui/Icons';
import { useAuth } from '../context/AuthContext';
import { usePostService } from '../context/PostContext';
import VoteBar from './VoteBar';

export function CommentItem({ comment, postId, onAddReply, onDeleteComment }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { user } = useAuth();
  const { deleteComment } = usePostService();

  const canDelete = user && comment?.user && user._id === comment.user._id;

  const handleReply = async (e) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text) return;
    try {
      await onAddReply(comment._id, text);
      setReplyText('');
      setReplying(false);
    } catch (err) {
      console.error('Reply failed', err);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteComment(postId, comment._id);
      onDeleteComment(comment._id);
    } catch (err) {}
  };

  const voteCount = Number((comment.upVotes || 0) - (comment.downVotes || 0));
  const upVoted = Boolean(comment.upVotedUsers?.includes(user?._id));
  const downVoted = Boolean(comment.downVotedUsers?.includes(user?._id));

  return (
    <div className="rounded-xl p-4 border border-gray-200 dark:border-neutral-800 shadow-sm transition-colors duration-200">
      <div className="flex justify-between items-start mb-2">
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {comment.user?.userName || 'User'}
          </div>
          <time className="text-xs text-gray-500 dark:text-gray-400">
            {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
          </time>
        </div>

        <VoteBar
          isComment
          postId={postId}
          commentId={comment._id}
          initialVotes={voteCount}
          initialUpVoted={upVoted}
          initialDownVoted={downVoted}
        />
      </div>

      <div className="text-sm text-gray-800 dark:text-gray-200 mb-3 whitespace-pre-wrap">
        {comment.text}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={() => setReplying((s) => !s)}
          className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-500 transition"
        >
          <Reply className="w-4 h-4" />
          <span>Reply</span>
        </button>

        {canDelete && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition"
          >
            <Trash className="w-4 h-4" />
            <span>Delete</span>
          </button>
        )}
      </div>

      {replying && (
        <form onSubmit={handleReply} className="mt-3 space-y-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
            className="w-full p-2 rounded border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Write your reply…"
            aria-label="Reply text"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setReplying(false)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50 transition hover:bg-indigo-700"
            >
              Reply
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
