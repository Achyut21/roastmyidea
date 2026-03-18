import { useState } from 'react';
import PropTypes from 'prop-types';
import BackWidget from './BackWidget.jsx';
import BackerList from './BackerList.jsx';
import './BackSection.css';

export default function BackSection({ idea }) {
  const [refreshKey, setRefreshKey] = useState(0);

  function handleBacked() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="back-section">
      <BackWidget idea={idea} onBacked={handleBacked} />
      <BackerList ideaId={idea._id} refreshKey={refreshKey} />
    </div>
  );
}

BackSection.propTypes = {
  idea: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
      .isRequired,
    verdict: PropTypes.string,
  }).isRequired,
};
