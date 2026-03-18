import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './BackerList.css';

export default function BackerList({ ideaId, refreshKey }) {
  const [backs, setBacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/ideas/${ideaId}/backs`)
      .then((r) => r.json())
      .then((data) => setBacks(data.backs || []))
      .finally(() => setLoading(false));
  }, [ideaId, refreshKey]);

  if (loading) return null;
  if (backs.length === 0) return <p className="backers-empty">No backers yet</p>;

  return (
    <div className="backer-list">
      <h3 className="backer-list-title">Backers</h3>
      <ul className="backer-items">
        {backs.map((b) => (
          <li key={b._id} className="backer-item">
            <span className="backer-name">{b.backerDisplayName}</span>
            <span className="backer-amount">{b.amount} RC</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

BackerList.propTypes = {
  ideaId: PropTypes.string.isRequired,
  refreshKey: PropTypes.number.isRequired,
};
