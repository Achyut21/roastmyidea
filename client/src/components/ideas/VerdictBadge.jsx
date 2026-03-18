import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './VerdictBadge.css';

function getTimeRemaining(createdAt) {
  const deadline = new Date(createdAt).getTime() + 7 * 24 * 60 * 60 * 1000;
  const diff = deadline - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

export default function VerdictBadge({ verdict = null, createdAt, compact = false }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(createdAt));

  useEffect(() => {
    if (verdict) return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(createdAt));
    }, 60000);
    return () => clearInterval(interval);
  }, [verdict, createdAt]);

  if (verdict === 'fireproof') {
    return <span className={`verdict-badge verdict-fireproof${compact ? ' compact' : ''}`}>FIREPROOF</span>;
  }
  if (verdict === 'torched') {
    return <span className={`verdict-badge verdict-torched${compact ? ' compact' : ''}`}>TORCHED</span>;
  }
  if (verdict === 'lukewarm') {
    return <span className={`verdict-badge verdict-lukewarm${compact ? ' compact' : ''}`}>LUKEWARM</span>;
  }
  if (!timeLeft) {
    return <span className={`verdict-badge verdict-lukewarm${compact ? ' compact' : ''}`}>Calculating...</span>;
  }
  return <span className={`verdict-badge verdict-open${compact ? ' compact' : ''}`}>{timeLeft}</span>;
}

VerdictBadge.propTypes = {
  verdict: PropTypes.string,
  createdAt: PropTypes.string.isRequired,
  compact: PropTypes.bool,
};
