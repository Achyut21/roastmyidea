import PropTypes from 'prop-types';
import { CATEGORIES } from '../../utils/categories.js';
import './FilterBar.css';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'mostInvested', label: 'Most Invested' },
  { value: 'mostRoasted', label: 'Most Roasted' },
  { value: 'mostDefended', label: 'Most Defended' },
  { value: 'endingSoon', label: 'Ending Soon' },
];

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'fireproof', label: 'Fireproof' },
  { value: 'torched', label: 'Torched' },
  { value: 'lukewarm', label: 'Lukewarm' },
];

export default function FilterBar({
  sort,
  category,
  status,
  onSortChange,
  onCategoryChange,
  onStatusChange,
}) {
  return (
    <div className="filter-bar">
      <select
        className="filter-select"
        value={sort}
        aria-label="Sort by"
        onChange={(e) => onSortChange(e.target.value)}
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <select
        className="filter-select"
        value={category}
        aria-label="Filter by category"
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <select
        className="filter-select"
        value={status}
        aria-label="Filter by status"
        onChange={(e) => onStatusChange(e.target.value)}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}

FilterBar.propTypes = {
  sort: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
};
