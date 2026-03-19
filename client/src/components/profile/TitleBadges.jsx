import PropTypes from 'prop-types';
import { Flame, Shield, Lightbulb } from 'lucide-react';
import './TitleBadges.css';

export default function TitleBadges({ roaster, defender, pitcher }) {
  return (
    <div className="title-badges">
      <span className="title-badge title-badge-roast">
        <Flame size={13} aria-hidden="true" /> {roaster}
      </span>
      <span className="title-badge title-badge-defend">
        <Shield size={13} aria-hidden="true" /> {defender}
      </span>
      <span className="title-badge title-badge-pitch">
        <Lightbulb size={13} aria-hidden="true" /> {pitcher}
      </span>
    </div>
  );
}

TitleBadges.propTypes = {
  roaster: PropTypes.string.isRequired,
  defender: PropTypes.string.isRequired,
  pitcher: PropTypes.string.isRequired,
};
