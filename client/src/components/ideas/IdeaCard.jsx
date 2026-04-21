import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Flame, Shield, Coins } from 'lucide-react';
import VerdictBadge from './VerdictBadge.jsx';
import { CATEGORY_LABELS } from '../../utils/categories.js';
import './IdeaCard.css';

export default function IdeaCard({ idea }) {
  return (
    <Link to={`/ideas/${idea._id}`} className="idea-card">
      <span className="idea-card-category">
        {CATEGORY_LABELS[idea.category] || idea.category}
      </span>
      <h2 className="idea-card-title">{idea.title}</h2>
      <p className="idea-card-author">by {idea.authorDisplayName}</p>
      <div className="idea-card-footer">
        <div className="idea-card-stats">
          <span className="stat-roast">
            <Flame size={13} aria-hidden="true" />
            {idea.roastCount}
          </span>
          <span className="stat-defense">
            <Shield size={13} aria-hidden="true" />
            {idea.defenseCount}
          </span>
          <span className="stat-rc">
            <Coins size={13} aria-hidden="true" />
            {idea.totalRoastCoinInvested} RC
          </span>
        </div>
        <VerdictBadge verdict={idea.verdict} createdAt={idea.createdAt} compact />
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
