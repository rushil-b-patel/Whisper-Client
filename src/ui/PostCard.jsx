import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Comment as CommentIcon } from './Icons';
import VoteBar from '../components/VoteBar';
import { useAuth } from '../context/AuthContext';
import { EditorRenderer } from '../components/Editor';

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!post || typeof post !== 'object') return null;

  const go = useCallback(() => {
    if (!post._id) return;
    navigate(`/post/${post._id}`);
  }, [post?._id, navigate]);

  const voteCount = Number((post.upVotes || 0) - (post.downVotes || 0));
  const upVoted = Boolean(
    user && Array.isArray(post.upVotedUsers) && post.upVotedUsers.includes(user._id)
  );
  const downVoted = Boolean(
    user && Array.isArray(post.downVotedUsers) && post.downVotedUsers.includes(user._id)
  );

  return (
    <article
      onClick={go}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && go()}
      className="cursor-pointer p-4 sm:p-6 rounded-2xl shadow hover:shadow-xl hover:scale-[1.01] transition-transform border border-gray-200 dark:border-neutral-800 w-full max-w-full"
      aria-label={`Open post ${post.title || ''}`}
    >
      <header className="flex items-center gap-3 mb-3 sm:mb-4">
        <img
          src={
            post.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              post.user?.userName || 'User'
            )}&background=random`
          }
          alt={`${post.user?.userName || 'User'} avatar`}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200 dark:border-neutral-700 flex-shrink-0"
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              post.user?.userName || 'User'
            )}`;
          }}
        />
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm sm:text-base truncate text-gray-900 dark:text-gray-100">
            {post.user?.userName || 'Deleted User'}
          </span>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {post.user?.department || 'General'} •{' '}
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
          </p>
        </div>
      </header>

      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 leading-snug text-gray-900 dark:text-gray-100 break-words">
        {post.title}
      </h2>

      <div className="mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-200">
        {post.description ? (
          <EditorRenderer data={post.description} />
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No description provided.</p>
        )}
      </div>

      {post.image && (
        <div className="mb-3 sm:mb-4">
          <img
            src={post.image}
            alt="Post media"
            className="w-full rounded-lg object-contain max-h-60 sm:max-h-72 bg-neutral-100 dark:bg-neutral-900"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      <footer className="flex items-center justify-between pt-2 sm:pt-3">
        <VoteBar
          postId={post._id}
          initialVotes={voteCount}
          initialUpVoted={upVoted}
          initialDownVoted={downVoted}
        />

        <div className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
          <CommentIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium">{post.commentCount || 0}</span>
        </div>
      </footer>
    </article>
  );
}
