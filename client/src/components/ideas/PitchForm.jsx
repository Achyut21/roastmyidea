import { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext.jsx';
import { CATEGORIES } from '../../utils/categories.js';
import './PitchForm.css';

export default function PitchForm({ existingIdea, onSuccess }) {
  const { getToken, updateBalance } = useAuth();
  const isEdit = Boolean(existingIdea);

  const [title, setTitle] = useState(existingIdea?.title || '');
  const [pitch, setPitch] = useState(existingIdea?.pitch || '');
  const [problem, setProblem] = useState(existingIdea?.problem || '');
  const [targetAudience, setTargetAudience] = useState(
    existingIdea?.targetAudience || ''
  );
  const [category, setCategory] = useState(existingIdea?.category || 'startup');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(
        isEdit ? `/api/ideas/${existingIdea._id}` : '/api/ideas',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            title,
            pitch,
            problem,
            targetAudience,
            category,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Something went wrong');
      if (!isEdit) {
        const me = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const meData = await me.json();
        if (meData.user) updateBalance(meData.user.roastCoinBalance);
      }
      onSuccess(data.idea._id);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="pitch-form" onSubmit={handleSubmit}>
      {error && <p className="pitch-error">{error}</p>}
      <label className="pitch-label">
        <span className="pitch-label-row">
          Title <span className="pitch-counter">{title.length}/100</span>
        </span>
        <input
          className="field-input"
          type="text"
          value={title}
          maxLength={100}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <label className="pitch-label">
        <span className="pitch-label-row">
          Pitch <span className="pitch-counter">{pitch.length}/500</span>
        </span>
        <textarea
          className="field-input field-textarea field-textarea-lg"
          value={pitch}
          maxLength={500}
          onChange={(e) => setPitch(e.target.value)}
          required
        />
      </label>
      <label className="pitch-label">
        <span className="pitch-label-row">
          Problem Statement <span className="pitch-optional">optional</span>
          <span className="pitch-counter">{problem.length}/300</span>
        </span>
        <textarea
          className="field-input field-textarea"
          value={problem}
          maxLength={300}
          onChange={(e) => setProblem(e.target.value)}
        />
      </label>
      <label className="pitch-label">
        <span className="pitch-label-row">
          Target Audience <span className="pitch-optional">optional</span>
          <span className="pitch-counter">{targetAudience.length}/200</span>
        </span>
        <input
          className="field-input"
          type="text"
          value={targetAudience}
          maxLength={200}
          onChange={(e) => setTargetAudience(e.target.value)}
        />
      </label>
      <label className="pitch-label">
        Category
        <select
          className="field-input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="pitch-btn" disabled={loading}>
        {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Submit Pitch'}
      </button>
    </form>
  );
}

PitchForm.propTypes = {
  existingIdea: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    pitch: PropTypes.string.isRequired,
    problem: PropTypes.string,
    targetAudience: PropTypes.string,
    category: PropTypes.string.isRequired,
  }),
  onSuccess: PropTypes.func.isRequired,
};

PitchForm.defaultProps = {
  existingIdea: null,
};
