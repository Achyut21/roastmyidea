import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext.jsx';
import { CATEGORY_LABELS } from '../../utils/categories.js';
import './IdeaHeader.css';

export default function IdeaHeader({ idea }) {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const isAuthor = user && user.id === idea.authorId.toString();
  const canDelete = isAuthor && idea.totalRoastCoinInvested === 0 && !idea.verdict;

  async function handleDelete() {
    if (!window.confirm('Delete this idea? This cannot be undone.')) return;
    const res = await fetch(`/api/ideas/${idea._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) navigate('/');
  }

  const postedDate = new Date(idea.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="idea-header">
      <div className="idea-header-top">
        <span className="idea-category">{CATEGORY_LABELS[idea.category] || idea.category}</span>
        {isAuthor && (
          <div className="idea-header-actions">
            {!idea.verdict && (
              <Link to={`/ideas/${idea._id}/edit`} className="idea-action-btn">Edit</Link>
            )}
            {canDelete && (
              <button className="idea-action-btn idea-action-delete" onClick={handleDelete}>
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      <h1 className="idea-title">{idea.title}</h1>
      <p className="idea-meta">
        by{' '}
        <Link to={`/users/${idea.authorId}`} className="idea-author-link">
          {idea.authorDisplayName}
        </Link>
        {' · '}Posted {postedDate}
      </p>
      <p className="idea-pitch">{idea.pitch}</p>
      {idea.problem && (
        <div className="idea-section">
          <h2 className="idea-section-title">Problem</h2>
          <p className="idea-section-text">{idea.problem}</p>
        </div>
      )}
      {idea.targetAudience && (
        <div className="idea-section">
          <h2 className="idea-section-title">Target Audience</h2>
          <p className="idea-section-text">{idea.targetAudience}</p>
        </div>
      )}
    </div>
  );
}

IdeaHeader.propTypes = {
  idea: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    authorDisplayName: PropTypes.string.isRequired,
    pitch: PropTypes.string.isRequired,
    problem: PropTypes.string,
    targetAudience: PropTypes.string,
    totalRoastCoinInvested: PropTypes.number.isRequired,
    verdict: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
};
