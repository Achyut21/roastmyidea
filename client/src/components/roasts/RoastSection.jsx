import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import RoastCard from './RoastCard.jsx';
import './RoastSection.css';

export default function RoastSection({ idea }) {
  const { user, getToken } = useAuth();
  const { showToast } = useToast();
  const [roasts, setRoasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isClosed = idea.verdict !== null;
  const isOwn = user && user.id === String(idea.authorId);

  useEffect(() => {
    fetch(`/api/ideas/${idea._id}/roasts`)
      .then((r) => r.json())
      .then((data) => setRoasts(data.roasts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [idea._id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!content.trim() || content.trim().length < 10) {
      return setError('Roast must be at least 10 characters');
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/ideas/${idea._id}/roasts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Something went wrong');
      setRoasts((prev) => [data.roast, ...prev]);
      setContent('');
      showToast('Roast posted 🔥');
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleRoastUpdate(updated) {
    setRoasts((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
  }

  function handleRoastDelete(roastId) {
    setRoasts((prev) => prev.filter((r) => r._id !== roastId));
  }

  return (
    <section className="roast-section">
      <h2 className="roast-section-title">Roasts &amp; Defenses</h2>
      {!isClosed && !isOwn && user && (
        <form className="roast-form" onSubmit={handleSubmit}>
          <textarea
            className="roast-textarea"
            placeholder="Why won't this work? Be specific. (10–500 chars)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={3}
          />
          <div className="roast-form-footer">
            <span className="roast-char-count">{content.length}/500</span>
            {error && <p className="roast-form-error">{error}</p>}
            <button type="submit" className="roast-submit-btn" disabled={submitting}>
              {submitting ? 'Posting...' : '🔥 Post Roast'}
            </button>
          </div>
        </form>
      )}
      {!user && (
        <p className="roast-login-msg">
          <a href="/auth">Log in</a> to roast or defend this idea.
        </p>
      )}
      {isOwn && !isClosed && (
        <p className="roast-login-msg">You can&apos;t roast your own idea — watch the debate unfold.</p>
      )}
      {loading && <p className="roast-state">Loading roasts...</p>}
      {!loading && roasts.length === 0 && (
        <p className="roast-state">No roasts yet. Be the first to tear this apart.</p>
      )}
      <div className="roast-list">
        {roasts.map((roast) => (
          <RoastCard
            key={roast._id}
            roast={roast}
            idea={idea}
            onUpdate={handleRoastUpdate}
            onDelete={handleRoastDelete}
          />
        ))}
      </div>
    </section>
  );
}

RoastSection.propTypes = {
  idea: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    verdict: PropTypes.string,
  }).isRequired,
};
