import { useEffect, useState, useRef } from 'react';
import { Bolt, BoltSlash, BoltSolid, BoltSlashSolid } from '../ui/Icons';
import { usePostService } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { showSuccess } from '../utils/toast';

export default function VoteBar({
  postId,
  commentId,
  isComment = false,
  initialVotes = 0,
  initialUpVoted = false,
  initialDownVoted = false,
}) {
  const { upVotePost, downVotePost, voteComment } = usePostService();
  const { user } = useAuth();

  const [count, setCount] = useState(Number(initialVotes || 0));
  const [state, setState] = useState({ up: !!initialUpVoted, down: !!initialDownVoted });
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    setCount(Number(initialVotes || 0));
    setState({ up: !!initialUpVoted, down: !!initialDownVoted });
  }, [initialVotes, initialUpVoted, initialDownVoted]);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const canVote = () => {
    if (isComment) return Boolean(commentId && postId);
    return Boolean(postId);
  };

  const doRemote = async (type) => {
    if (!canVote()) throw new Error('Invalid target for vote');
    if (isComment) {
      return voteComment(postId, commentId, type);
    }
    return type === 'up' ? upVotePost(postId) : downVotePost(postId);
  };

  const onCast = async (type) => {
    if (!user) {
      showSuccess('Please log in to vote');
      return;
    }
    if (!canVote()) {
      return;
    }
    if (busy) return;
    setBusy(true);

    const prev = { state: { ...state }, count };
    const removing = state[type];
    let delta;
    if (type === 'up') {
      delta = removing ? -1 : state.down ? 2 : 1;
      setState({ up: !removing, down: false });
    } else {
      delta = removing ? 1 : state.up ? -2 : -1;
      setState({ up: false, down: !removing });
    }
    setCount((c) => c + delta);

    try {
      const res = await doRemote(type);
      if (!res || (res.success !== undefined && !res.success)) {
        throw new Error(res?.message || 'Vote failed');
      }
    } catch (err) {
      setState(prev.state);
      setCount(prev.count);
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  const wrapperClasses = `flex items-center gap-3 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm select-none ${
    state.up
      ? 'bg-indigo-600 text-white'
      : state.down
        ? 'bg-rose-600 text-white'
        : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100'
  }`;

  return (
    <div
      className={wrapperClasses}
      onClick={(e) => e.stopPropagation()}
      role="group"
      aria-label="Voting controls"
    >
      <button
        type="button"
        onClick={() => onCast('up')}
        disabled={busy}
        title={state.up ? 'Remove upvote' : 'Upvote'}
        className="p-1 rounded hover:scale-105 transition-transform disabled:opacity-60"
        aria-pressed={state.up}
      >
        {state.up ? <BoltSolid className="w-5 h-5" /> : <Bolt className="w-5 h-5" />}
      </button>

      <span className="font-mono font-semibold" aria-live="polite">
        {count}
      </span>

      <button
        type="button"
        onClick={() => onCast('down')}
        disabled={busy}
        title={state.down ? 'Remove downvote' : 'Downvote'}
        className="p-1 rounded hover:scale-105 transition-transform disabled:opacity-60"
        aria-pressed={state.down}
      >
        {state.down ? <BoltSlashSolid className="w-5 h-5" /> : <BoltSlash className="w-5 h-5" />}
      </button>
    </div>
  );
}
