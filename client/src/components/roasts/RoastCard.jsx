import { useState } from 'react';
import PropTypes from 'prop-types';
import { ThumbsUp, Flame, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import DefenseThread from './DefenseThread.jsx';
import './RoastCard.css';

export default function RoastCard({ roast, idea, onUpdate, onDelete }) {
  const { user, getToken } = useAuth();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(roast.content);
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);
  const [upvoting, setUpvoting] = useState(false);
  const [showDefenses, setShowDefenses] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [defenseCount, setDefenseCount] = useState(roast.defenseCount || 0);

  const isOwn = user && user.id === roast.authorId?.toString();
  const hasUpvoted = user && roast.upvotedBy?.some((id) => id.toString() === user.id);
  const isClosed = idea.verdict !== null;

  async function handleUpvote() {
    if (!user || isOwn || upvoting) return;
    setUpvoting(true);
    try {
      const res = await fetch(`/api/roasts/${roast._id}/upvote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        onUpdate({
          ...roast,
          upvoteCount: data.upvoteCount,
          upvotedBy: data.upvoted
            ? [...(roast.upvotedBy || []), { toString: () => user.id }]
            : (roast.upvotedBy || []).filter((id) => id.toString() !== user.id),
        });
      }
    } catch {
      showToast('Failed to upvote');
    } finally {
      setUpvoting(false);
    }
  }

  async function handleSave() {
    setEditError('');
    if (!editContent.trim() || editContent.trim().length < 10) {
      return setEditError('Must be at least 10 characters');
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/roasts/${roast._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ content: editContent }),
      });
      const data = await res.json();
      if (!res.ok) return setEditError(data.error || 'Failed to save');
      onUpdate(data.roast);
      setEditing(false);
      showToast('Roast updated');
    } catch {
      setEditError('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/roasts/${roast._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        onDelete(roast._id);
        showToast('Roast deleted');
      }
    } catch {
      showToast('Failed to delete');
    }
  }

  return (
    <article className="roast-card">
      <div className="roast-card-header">
        <span className="roast-card-flame">
          <Flame size={13} aria-hidden="true" />
        </span>
        <span className="roast-card-author">{roast.authorDisplayName}</span>
        <span className="roast-card-dot">·</span>
        <span className="roast-card-time">
          {new Date(roast.createdAt).toLocaleDateString()}
        </span>
        {isOwn && !isClosed && (
          <div className="roast-card-actions">
            <button
              className="roast-card-action-btn"
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
            {!confirmDelete ? (
              <button
                className="roast-card-action-btn danger"
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </button>
            ) : (
              <span className="roast-confirm-row">
                <span className="roast-confirm-text">Sure?</span>
                <button className="roast-card-action-btn danger" onClick={handleDelete}>
                  Yes
                </button>
                <button
                  className="roast-card-action-btn"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </button>
              </span>
            )}
          </div>
        )}
      </div>
      {editing ? (
        <div className="roast-edit-area">
          <textarea
            className="roast-textarea"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={500}
            rows={3}
          />
          {editError && <p className="roast-form-error">{editError}</p>}
          <button className="roast-submit-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      ) : (
        <p className="roast-card-content">{roast.content}</p>
      )}
      <div className="roast-card-footer">
        <button
          className={`roast-upvote-btn${hasUpvoted ? ' upvoted' : ''}`}
          onClick={handleUpvote}
          disabled={!user || isOwn || upvoting}
          aria-label={`Upvote this roast, ${roast.upvoteCount || 0} upvotes`}
          aria-pressed={hasUpvoted ? 'true' : 'false'}
        >
          <ThumbsUp size={13} aria-hidden="true" />
          {roast.upvoteCount || 0}
        </button>
        <button
          className="roast-defend-toggle"
          onClick={() => setShowDefenses((v) => !v)}
          aria-expanded={showDefenses ? 'true' : 'false'}
          aria-label={`${showDefenses ? 'Hide' : 'Show'} defenses (${defenseCount})`}
        >
          <Shield size={13} aria-hidden="true" />
          {showDefenses ? 'Hide' : 'Defend'} ({defenseCount})
        </button>
      </div>
      {showDefenses && (
        <DefenseThread roast={roast} idea={idea} onCountChange={setDefenseCount} />
      )}
    </article>
  );
}

RoastCard.propTypes = {
  roast: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    authorDisplayName: PropTypes.string,
    content: PropTypes.string.isRequired,
    upvoteCount: PropTypes.number,
    upvotedBy: PropTypes.array,
    defenseCount: PropTypes.number,
    createdAt: PropTypes.string,
  }).isRequired,
  idea: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    verdict: PropTypes.string,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
