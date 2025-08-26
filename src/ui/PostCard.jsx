import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Comment } from './Icons';
import VoteBar from '../components/VoteBar';
import { useAuth } from '../context/AuthContext';
import { EditorRenderer } from '../components/Editor';

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const go = useCallback(() => post?._id && navigate(`/post/${post._id}`), [post?._id, navigate]);

  const voteCount = post.upVotes - post.downVotes;
  const upVoted = user && post.upVotedUsers.includes(user._id);
  const downVoted = user && post.downVotedUsers.includes(user._id);

  if (!post || !post.user || !post.title) {
    return null;
  }

  return (
    <div
      className="p-5 sm:p-6 rounded-2xl shadow hover:shadow-xl transition cursor-pointer border border-gray-200 dark:border-slate-800"
      onClick={go}
    >
      <div className="flex items-center gap-3 mb-4">
        <img
          src={post.avatar || `https://ui-avatars.com/api/?name=${post.user?.userName || 'User'}`}
          alt="User Avatar"
          className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-slate-600"
        />
        <div className="flex flex-col">
          <span className="font-semibold truncate">
            {post.user?.userName || 'Deleted User'}
          </span>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {post.user.department || 'General'} • {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold hover:underline">{post.title}</h2>

      <div className="mb-4 text-sm leading-relaxed">
        <EditorRenderer data={post.description} />
      </div>

      {post.image && (
        <img
          src={post.image}
          alt="Post visual"
          className="w-full rounded-lg mb-4 object-cover max-h-48"
        />
      )}

      <div className="flex justify-between items-center">
        <VoteBar
          postId={post._id}
          initialVotes={voteCount}
          initialUpVoted={upVoted}
          initialDownVoted={downVoted}
        />
        <div className="flex items-center gap-1">
          <Comment className="w-5 h-5" />
          <span className="font-serif">{post.commentCount || 0}</span>
        </div>
      </div>
    </div>
  );
}
