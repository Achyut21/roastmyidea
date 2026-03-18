import PropTypes from 'prop-types';
import './TitleBadges.css';

export default function TitleBadges({ roaster, defender, pitcher }) {
  return (
    <div className="title-badges">
      <span className="title-badge title-badge-roast">🔥 {roaster}</span>
      <span className="title-badge title-badge-defend">🛡️ {defender}</span>
      <span className="title-badge title-badge-pitch">💡 {pitcher}</span>
    </div>
  );
}

TitleBadges.propTypes = {
  roaster: PropTypes.string.isRequired,
  defender: PropTypes.string.isRequired,
  pitcher: PropTypes.string.isRequired,
};
