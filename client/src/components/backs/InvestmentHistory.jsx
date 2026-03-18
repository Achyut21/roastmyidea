import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './InvestmentHistory.css';

function outcomeLabel(verdict) {
  if (!verdict) return { text: 'Pending', cls: 'outcome-pending' };
  if (verdict === 'fireproof') return { text: '1.5x return', cls: 'outcome-win' };
  if (verdict === 'torched') return { text: 'Lost', cls: 'outcome-loss' };
  return { text: 'Refunded', cls: 'outcome-refund' };
}

export default function InvestmentHistory({ userId }) {
  const [backs, setBacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}/backs`)
      .then((r) => r.json())
      .then((data) => setBacks(data.backs || []))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p className="inv-state">Loading...</p>;
  if (backs.length === 0) return <p className="inv-state">No investments yet</p>;

  return (
    <ul className="inv-list">
      {backs.map((b) => {
        const outcome = outcomeLabel(b.verdict);
        return (
          <li key={b._id} className="inv-item">
            <Link to={`/ideas/${b.ideaId}`} className="inv-title">{b.ideaTitle}</Link>
            <span className="inv-amount">{b.amount} RC</span>
            <span className={`inv-outcome ${outcome.cls}`}>{outcome.text}</span>
          </li>
        );
      })}
    </ul>
  );
}

InvestmentHistory.propTypes = {
  userId: PropTypes.string.isRequired,
};
