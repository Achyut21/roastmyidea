import PropTypes from 'prop-types';
import './ProfileStats.css';

function StatItem({ label, value }) {
  return (
    <div className="stat-item">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

StatItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default function ProfileStats({ stats }) {
  return (
    <div className="profile-stats">
      <StatItem label="RC Balance" value={`${stats.roastCoinBalance} RC`} />
      <StatItem label="Ideas Pitched" value={stats.ideasPitched} />
      <StatItem label="Fireproof'd" value={stats.ideasFireproof} />
      <StatItem label="Torched" value={stats.ideasTorched} />
      <StatItem label="Roasts Written" value={stats.roastsWritten} />
      <StatItem label="Defenses Written" value={stats.defensesWritten} />
      <StatItem label="RC Invested" value={`${stats.totalRcInvested} RC`} />
    </div>
  );
}

ProfileStats.propTypes = {
  stats: PropTypes.shape({
    roastCoinBalance: PropTypes.number.isRequired,
    ideasPitched: PropTypes.number.isRequired,
    ideasFireproof: PropTypes.number.isRequired,
    ideasTorched: PropTypes.number.isRequired,
    roastsWritten: PropTypes.number.isRequired,
    defensesWritten: PropTypes.number.isRequired,
    totalRcInvested: PropTypes.number.isRequired,
  }).isRequired,
};
