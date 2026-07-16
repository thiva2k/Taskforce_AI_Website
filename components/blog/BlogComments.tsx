import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import {
  fetchComments,
  submitComment,
  BlogComment,
} from '../../lib/wordpress';

interface BlogCommentsProps {
  postId: number;
}

/**
 * Client-side comment section for a blog post.
 *
 * SEO / safety notes:
 *  - Renders nothing during the Puppeteer prerender (window.__IS_PRERENDER__),
 *    so comments are never baked into the prerendered SEO HTML.
 *  - All network calls are wrapped in try/catch and run after the article has
 *    already rendered, so a slow or failing WordPress never blocks the page.
 *  - Only WordPress-approved comments are returned by the API; newly submitted
 *    comments go to moderation and show a "pending" message.
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
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    if (isPrerender || !postId) return;
    let mounted = true;

    fetchComments(postId)
      .then((list) => {
        if (mounted) setComments(list);
      })
      .catch(() => {
        // Non-critical: hide the list, keep the form usable.
        if (mounted) setLoadFailed(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [postId, isPrerender]);

  // Never render during prerender — comments are a pure client-side enhancement.
  if (isPrerender) return null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? ''
      : d.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
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
      });

      if (status === 'approved') {
        // Rare (only if the author was auto-approved) — refresh the list.
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

  return (
    <section className="mt-20 border-t border-white/10 pt-12">
      <h2 className="flex items-center gap-3 text-2xl font-bold text-white mb-8">
        <MessageSquare className="w-6 h-6 text-primary-light" />
        Comments
        {!loading && !loadFailed && comments.length > 0 && (
          <span className="text-base font-normal text-gray-500">({comments.length})</span>
        )}
      </h2>

      {/* Comment list */}
      {loading ? (
        <p className="text-gray-500 text-sm mb-10">Loading comments…</p>
      ) : comments.length > 0 ? (
        <div className="space-y-6 mb-12">
          {comments.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white">{c.authorName}</span>
                <span className="text-xs text-gray-500 font-mono">{formatDate(c.date)}</span>
              </div>
              <div
                className="text-gray-300 text-sm leading-relaxed [&>p]:mb-2 [&_a]:text-primary-light"
                dangerouslySetInnerHTML={{ __html: c.content }}
              />
            </div>
          ))}
        </div>
      ) : (
        !loadFailed && (
          <p className="text-gray-500 text-sm mb-10">
            No comments yet. Be the first to share your thoughts.
          </p>
        )
      )}

      {/* Comment form */}
      <div className="rounded-2xl border border-white/10 bg-dark-surface/60 backdrop-blur-xl p-6 md:p-8">
        <h3 className="text-lg font-bold text-white mb-1">Leave a comment</h3>
        <p className="text-xs text-gray-500 mb-6">
          Your email will not be published. Comments are reviewed before appearing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:border-primary-DEFAULT/50 focus:outline-none transition-colors"
            />
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:border-primary-DEFAULT/50 focus:outline-none transition-colors"
            />
          </div>
          <textarea
            placeholder="Your comment"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:border-primary-DEFAULT/50 focus:outline-none transition-colors resize-y"
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
            className="inline-flex items-center justify-center rounded-xl bg-primary-DEFAULT px-6 py-3 font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Post Comment'}
          </button>
        </form>
      </div>
    </section>
  );
};
