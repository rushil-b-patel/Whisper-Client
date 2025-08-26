import { useEffect, useState } from 'react';
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
  const [count, setCount] = useState(initialVotes);
  const [state, setState] = useState({
    up: initialUpVoted,
    down: initialDownVoted,
  });
  const [busy, setBusy] = useState(false);
  const { upVotePost, downVotePost, voteComment } = usePostService();
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!user || !postId) return;

    setState({
      up: initialUpVoted,
      down: initialDownVoted,
    });
    setCount(initialVotes);
  }, [postId, user, initialUpVoted, initialDownVoted, initialVotes]);

  const cast = async (type) => {
    if (!user) {
      showSuccess('Log in to vote');
      return;
    }
    if (busy) return;
    setBusy(true);

    const prevState = { ...state };
    const prevCount = count;
    const removing = state[type];
    let delta;
    if (type === 'up') {
      delta = removing ? -1 : state.down ? +2 : +1;
      setState({ up: !removing, down: false });
    } else {
      delta = removing ? +1 : state.up ? -2 : -1;
      setState({ up: false, down: !removing });
    }
    setCount(prevCount + delta);

    try {
      const action = isComment
        ? () => voteComment(token, postId, commentId, type)
        : type === 'up'
          ? () => upVotePost(token, postId)
          : () => downVotePost(token, postId);

      const res = await action();
      if (!res.success) throw new Error(res.message);
    } catch (e) {
      setState(prevState);
      setCount(prevCount);
      e.message || 'Vote failed';
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-center px-4 py-2 space-x-4 rounded-full text-sm border border-gray-200 dark:border-gray-700 shadow-sm transition 
    ${
      state.up
        ? 'bg-[#EA2F14] text-white'
        : state.down
          ? 'bg-[#9929EA] text-black'
          : 'bg-white text-gray-800 dark:bg-[#1a1c1f] dark:text-gray-200'
    }`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => cast('up')}
        disabled={busy}
        className="p-1 hover:scale-110 hover:opacity-90 transition"
        title={state.up ? 'Remove upvote' : 'Upvote'}
      >
        {state.up ? <BoltSolid /> : <Bolt />}
      </button>

      <span className="font-mono font-semibold">{count}</span>

      <button
        onClick={() => cast('down')}
        disabled={busy}
        className="p-1 hover:scale-110 transition"
        title={state.down ? 'Remove downvote' : 'Downvote'}
      >
        {state.down ? <BoltSlashSolid /> : <BoltSlash />}
      </button>
    </div>
  );
}
