import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import VerdictBadge from './VerdictBadge.jsx';
import { CATEGORY_LABELS } from '../../utils/categories.js';
import './IdeaCard.css';

export default function IdeaCard({ idea }) {
  return (
    <Link to={`/ideas/${idea._id}`} className="idea-card">
      <div className="idea-card-top">
        <span className="idea-card-category">{CATEGORY_LABELS[idea.category] || idea.category}</span>
        <VerdictBadge verdict={idea.verdict} createdAt={idea.createdAt} compact />
      </div>
      <h3 className="idea-card-title">{idea.title}</h3>
      <p className="idea-card-author">by {idea.authorDisplayName}</p>
      <div className="idea-card-stats">
        <span className="stat-roast">🔥 {idea.roastCount}</span>
        <span className="stat-defense">🛡️ {idea.defenseCount}</span>
        <span className="stat-rc">💰 {idea.totalRoastCoinInvested} RC</span>
      </div>
    </Link>
  );
}

IdeaCard.propTypes = {
  idea: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    authorDisplayName: PropTypes.string.isRequired,
    roastCount: PropTypes.number.isRequired,
    defenseCount: PropTypes.number.isRequired,
    totalRoastCoinInvested: PropTypes.number.isRequired,
    verdict: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
};
