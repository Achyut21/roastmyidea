import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ThumbsUp, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import './DefenseThread.css';

export default function DefenseThread({ roast, idea, onCountChange }) {
  const { user, getToken } = useAuth();
  const { showToast } = useToast();
  const [defenses, setDefenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const isClosed = idea.verdict !== null;
  const isRoastAuthor = user && user.id === roast.authorId?.toString();

  useEffect(() => {
    fetch(`/api/roasts/${roast._id}/defenses`)
      .then((r) => r.json())
      .then((data) => {
        const loaded = data.defenses || [];
        setDefenses(loaded);
        if (onCountChange) onCountChange(loaded.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roast._id, onCountChange]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!content.trim() || content.trim().length < 10) {
      return setError('Defense must be at least 10 characters');
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/roasts/${roast._id}/defenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Something went wrong');
      setDefenses((prev) => {
        const next = [data.defense, ...prev];
        if (onCountChange) onCountChange(next.length);
        return next;
      });
      setContent('');
      showToast('Defense posted!');
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpvote(defense) {
    if (!user) return;
    try {
      const res = await fetch(`/api/defenses/${defense._id}/upvote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDefenses((prev) =>
          prev.map((d) =>
            d._id === defense._id
              ? {
                  ...d,
                  upvoteCount: data.upvoteCount,
                  upvotedBy: data.upvoted
                    ? [...(d.upvotedBy || []), { toString: () => user.id }]
                    : (d.upvotedBy || []).filter((id) => id.toString() !== user.id),
                }
              : d
          )
        );
      }
    } catch {
      showToast('Failed to upvote');
    }
  }

  async function handleSaveEdit(defense) {
    if (!editContent.trim() || editContent.trim().length < 10) return;
    try {
      const res = await fetch(`/api/defenses/${defense._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ content: editContent }),
      });
      const data = await res.json();
      if (res.ok) {
        setDefenses((prev) =>
          prev.map((d) => (d._id === defense._id ? data.defense : d))
        );
        setEditingId(null);
        showToast('Defense updated');
      }
    } catch {
      showToast('Failed to update');
    }
  }

  async function handleDelete(defense) {
    try {
      const res = await fetch(`/api/defenses/${defense._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setDefenses((prev) => {
          const next = prev.filter((d) => d._id !== defense._id);
          if (onCountChange) onCountChange(next.length);
          return next;
        });
        setConfirmDeleteId(null);
        showToast('Defense deleted');
      }
    } catch {
      showToast('Failed to delete');
    }
  }

  return (
    <div className="defense-thread">
      <div className="defense-thread-label">
        <Shield size={12} aria-hidden="true" /> Defenses
      </div>
      {!isClosed && !isRoastAuthor && user && (
        <form className="defense-form" onSubmit={handleSubmit}>
          <textarea
            className="defense-textarea"
            placeholder="Counter this roast — why does this idea actually work? (10–500 chars)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={2}
          />
          <div className="defense-form-footer">
            <span className="defense-char-count">{content.length}/500</span>
            {error && <p className="defense-form-error">{error}</p>}
            <button type="submit" className="defense-submit-btn" disabled={submitting}>
              {submitting ? (
                'Posting...'
              ) : (
                <>
                  <Shield size={13} aria-hidden="true" /> Defend
                </>
              )}
            </button>
          </div>
        </form>
      )}
      {!user && (
        <p className="defense-login-msg">
          <a href="/auth">Log in</a> to post a defense.
        </p>
      )}
      {loading && <p className="defense-state">Loading defenses...</p>}
      {!loading && defenses.length === 0 && (
        <p className="defense-state">No defenses yet. Step up.</p>
      )}
      <div className="defense-list">
        {defenses.map((defense) => {
          const isOwn = user && user.id === defense.authorId?.toString();
          const hasUpvoted =
            user && defense.upvotedBy?.some((id) => id.toString() === user.id);
          return (
            <div key={defense._id} className="defense-card">
              <div className="defense-card-header">
                <Shield size={11} aria-hidden="true" className="defense-icon" />
                <span className="defense-author">{defense.authorDisplayName}</span>
                <span className="defense-dot">·</span>
                <span className="defense-time">
                  {new Date(defense.createdAt).toLocaleDateString()}
                </span>
                {isOwn && !isClosed && (
                  <div className="defense-card-actions">
                    <button
                      className="defense-action-btn"
                      onClick={() => {
                        setEditingId(defense._id);
                        setEditContent(defense.content);
                      }}
                    >
                      Edit
                    </button>
                    {confirmDeleteId !== defense._id ? (
                      <button
                        className="defense-action-btn danger"
                        onClick={() => setConfirmDeleteId(defense._id)}
                      >
                        Delete
                      </button>
                    ) : (
                      <span className="defense-confirm-row">
                        <span className="defense-confirm-text">Sure?</span>
                        <button
                          className="defense-action-btn danger"
                          onClick={() => handleDelete(defense)}
                        >
                          Yes
                        </button>
                        <button
                          className="defense-action-btn"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
              {editingId === defense._id ? (
                <div className="defense-edit-area">
                  <textarea
                    className="defense-textarea"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    maxLength={500}
                    rows={2}
                  />
                  <div className="defense-form-footer">
                    <button
                      className="defense-submit-btn"
                      onClick={() => handleSaveEdit(defense)}
                    >
                      Save
                    </button>
                    <button
                      className="defense-action-btn"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="defense-content">{defense.content}</p>
              )}
              <div className="defense-card-footer">
                <button
                  className={`defense-upvote-btn${hasUpvoted ? ' upvoted' : ''}`}
                  onClick={() => handleUpvote(defense)}
                  disabled={!user || isOwn}
                >
                  <ThumbsUp size={11} aria-hidden="true" />
                  {defense.upvoteCount || 0}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

DefenseThread.propTypes = {
  roast: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }).isRequired,
  idea: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    verdict: PropTypes.string,
  }).isRequired,
  onCountChange: PropTypes.func,
};

DefenseThread.defaultProps = { onCountChange: null };
