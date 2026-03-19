import { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import './BackWidget.css';

export default function BackWidget({ idea, onBacked }) {
  const { user, getToken, updateBalance } = useAuth();
  const { showToast } = useToast();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isClosed = idea.verdict !== null;
  const isOwn = user && user.id === String(idea.authorId);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const parsed = parseInt(amount, 10);
    if (isNaN(parsed) || parsed < 10) {
      return setError('Minimum is 10 RC');
    }
    if (parsed > user.roastCoinBalance) {
      return setError('Insufficient balance');
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/ideas/${idea._id}/back`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ amount: parsed }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Something went wrong');
      updateBalance(data.newBalance);
      setAmount('');
      showToast(`Invested ${parsed} RC`);
      onBacked();
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <p className="back-msg">
        <a href="/auth">Log in</a> to invest RoastCoin
      </p>
    );
  }
  if (isOwn) {
    return <p className="back-msg">You can&apos;t back your own idea</p>;
  }
  if (isClosed) {
    return <p className="back-msg">Investments closed — verdict reached</p>;
  }

  return (
    <form className="back-widget" onSubmit={handleSubmit}>
      <p className="back-balance">
        Your balance: <strong>{user.roastCoinBalance} RC</strong>
      </p>
      {error && <p className="back-error">{error}</p>}
      <div className="back-row">
        <input
          className="back-input"
          type="number"
          min={10}
          max={user.roastCoinBalance}
          placeholder="Min 10 RC"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button type="submit" className="back-btn" disabled={loading}>
          {loading ? 'Investing...' : 'Invest'}
        </button>
      </div>
    </form>
  );
}

BackWidget.propTypes = {
  idea: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    verdict: PropTypes.string,
  }).isRequired,
  onBacked: PropTypes.func.isRequired,
};
