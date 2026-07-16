import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, CornerDownRight, X } from 'lucide-react';
import {
  fetchComments,
  submitComment,
  BlogComment,
} from '../../lib/wordpress';

interface BlogCommentsProps {
  postId: number;
}

interface ThreadedComment extends BlogComment {
  replies: ThreadedComment[];
}

// Build a parent→children tree from the flat WordPress comment list.
function buildTree(list: BlogComment[]): ThreadedComment[] {
  const map = new Map<number, ThreadedComment>();
  list.forEach((c) => map.set(c.id, { ...c, replies: [] }));

  const roots: ThreadedComment[] = [];
  map.forEach((node) => {
    const parent = node.parent && map.get(node.parent);
    if (parent) parent.replies.push(node);
    else roots.push(node);
  });
  return roots;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Client-side comment section for a blog post.
 *
 * SEO / safety notes:
 *  - Renders nothing during the Puppeteer prerender (window.__IS_PRERENDER__),
 *    so comments are never baked into the prerendered SEO HTML.
 *  - All network calls run after the article renders and are wrapped in
 *    try/catch, so a slow or failing WordPress never blocks the page.
 *  - Only WordPress-approved comments are returned by the API; new submissions
 *    go to moderation.
 */
export const BlogComments: React.FC<BlogCommentsProps> = ({ postId }) => {
  const isPrerender =
    typeof window !== 'undefined' && (window as any).__IS_PRERENDER__ === true;

  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [replyTo, setReplyTo] = useState<BlogComment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isPrerender || !postId) return;
    let mounted = true;

    fetchComments(postId)
      .then((list) => mounted && setComments(list))
      .catch(() => mounted && setLoadFailed(true))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [postId, isPrerender]);

  const tree = useMemo(() => buildTree(comments), [comments]);

  if (isPrerender) return null;

  const startReply = (comment: BlogComment) => {
    setReplyTo(comment);
    setNotice(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setNotice({ type: 'error', text: 'Please fill in your name, email and comment.' });
      return;
    }

    setSubmitting(true);
    try {
      const status = await submitComment({
        postId,
        authorName: name.trim(),
        authorEmail: email.trim(),
        content: message.trim(),
        parent: replyTo?.id || 0,
      });

      if (status === 'approved') {
        try {
          setComments(await fetchComments(postId));
        } catch {
          /* ignore refresh failure */
        }
        setNotice({ type: 'success', text: 'Thanks! Your comment has been posted.' });
      } else {
        setNotice({
          type: 'success',
          text: 'Thanks! Your comment has been submitted and is awaiting moderation.',
        });
      }
      setName('');
      setEmail('');
      setMessage('');
      setReplyTo(null);
    } catch (err: any) {
      setNotice({
        type: 'error',
        text:
          err?.message ||
          'Sorry, your comment could not be submitted right now. Please try again later.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const CommentNode: React.FC<{ comment: ThreadedComment; depth: number }> = ({
    comment,
    depth,
  }) => {
    // Cap the visual indent so deep threads stay readable on mobile.
    const isReply = depth > 0;
    return (
      <div
        className={
          isReply
            ? 'mt-4 pl-4 sm:pl-6 border-l-2 border-primary-DEFAULT/20'
            : ''
        }
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/20 transition-colors p-5">
          <div className="flex items-start gap-4">
            <div
              className={`shrink-0 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br from-primary-DEFAULT to-accent ${
                isReply ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
              }`}
            >
              {initials(comment.authorName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                <span className="font-semibold text-white">{comment.authorName}</span>
                <span className="text-xs text-gray-500 font-mono">
                  {formatDate(comment.date)}
                </span>
              </div>
              <div
                className="text-gray-300 text-sm leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&_a]:text-primary-light [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />
              <button
                type="button"
                onClick={() => startReply(comment)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary-light transition-colors"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                Reply
              </button>
            </div>
          </div>
        </div>

        {comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentNode key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const total = comments.length;
  const inputClass =
    'w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:border-primary-DEFAULT/50 focus:ring-1 focus:ring-primary-DEFAULT/30 focus:outline-none transition-all';

  return (
    <section className="mt-20 border-t border-white/10 pt-12">
      <h2 className="flex items-center gap-3 text-2xl font-bold text-white mb-8">
        <MessageSquare className="w-6 h-6 text-primary-light" />
        Comments
        {!loading && !loadFailed && total > 0 && (
          <span className="text-base font-normal text-gray-500">({total})</span>
        )}
      </h2>

      {/* Threaded comment list */}
      {loading ? (
        <p className="text-gray-500 text-sm mb-10">Loading comments…</p>
      ) : total > 0 ? (
        <div className="space-y-6 mb-12">
          {tree.map((c) => (
            <CommentNode key={c.id} comment={c} depth={0} />
          ))}
        </div>
      ) : (
        !loadFailed && (
          <p className="text-gray-500 text-sm mb-10">
            No comments yet. Be the first to share your thoughts.
          </p>
        )
      )}

      {/* Comment / reply form */}
      <div
        ref={formRef}
        className="rounded-2xl border border-white/10 bg-dark-surface/60 backdrop-blur-xl p-6 md:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-primary-DEFAULT/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <h3 className="text-lg font-bold text-white mb-1">
            {replyTo ? 'Write a reply' : 'Leave a comment'}
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            Your email will not be published. Comments are reviewed before appearing.
          </p>

          {replyTo && (
            <div className="flex items-center justify-between gap-3 mb-5 rounded-xl border border-primary-DEFAULT/20 bg-primary-DEFAULT/5 px-4 py-3">
              <span className="text-sm text-gray-300 truncate">
                Replying to{' '}
                <span className="font-semibold text-primary-light">{replyTo.authorName}</span>
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="shrink-0 text-gray-400 hover:text-white transition-colors"
                aria-label="Cancel reply"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <textarea
              placeholder={replyTo ? `Reply to ${replyTo.authorName}…` : 'Your comment'}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`${inputClass} resize-y`}
            />

            {notice && (
              <p
                className={`text-sm ${
                  notice.type === 'success' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {notice.text}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-DEFAULT to-primary-dark px-6 py-3 font-semibold text-white shadow-lg shadow-primary-DEFAULT/20 hover:shadow-primary-DEFAULT/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {submitting ? 'Submitting…' : replyTo ? 'Post Reply' : 'Post Comment'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
