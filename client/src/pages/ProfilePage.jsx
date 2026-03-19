import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ArrowLeft, Flame, Shield, Lightbulb, Coins } from 'lucide-react';
import InvestmentHistory from '../components/backs/InvestmentHistory.jsx';
import { timeAgo } from '../utils/timeAgo.js';
import './ProfilePage.css';

function StatCard({ label, value, accent }) {
  return (
    <div className={`profile-stat-card ${accent ? `accent-${accent}` : ''}`}>
      <span className="profile-stat-value">{value}</span>
      <span className="profile-stat-label">{label}</span>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  accent: PropTypes.string,
};

StatCard.defaultProps = { accent: null };

function StatGroup({ title, children }) {
  return (
    <div className="profile-stat-group">
      <h2 className="profile-stat-group-title">{title}</h2>
      <div className="profile-stat-row">{children}</div>
    </div>
  );
}

StatGroup.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('stats');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users/${id}/profile`)
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
          document.title = `${data.profile.displayName} | RoastMyIdea`;
        } else {
          setError(data.error || 'User not found');
        }
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <main className="main-content">
        <p className="profile-state">Loading...</p>
      </main>
    );
  if (error)
    return (
      <main className="main-content">
        <p className="profile-state">{error}</p>
      </main>
    );

  const initials = profile.displayName.slice(0, 2).toUpperCase();
  const { stats } = profile;

  return (
    <main className="main-content profile-page">
      <button className="page-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={14} aria-hidden="true" />
        Back
      </button>

      <div className="profile-hero">
        <div className="profile-avatar" aria-hidden="true">
          {initials}
        </div>
        <div className="profile-hero-info">
          <h1 className="profile-name">{profile.displayName}</h1>
          <p className="profile-joined">Joined {timeAgo(profile.createdAt)}</p>
          <div className="profile-title-badges">
            <span className="profile-title-badge badge-roast">
              <Flame size={12} aria-hidden="true" /> {profile.titles.roaster}
            </span>
            <span className="profile-title-badge badge-defend">
              <Shield size={12} aria-hidden="true" /> {profile.titles.defender}
            </span>
            <span className="profile-title-badge badge-pitch">
              <Lightbulb size={12} aria-hidden="true" /> {profile.titles.pitcher}
            </span>
          </div>
        </div>
        <div className="profile-rc-hero">
          <Coins size={20} aria-hidden="true" className="profile-rc-icon" />
          <span className="profile-rc-value">{profile.roastCoinBalance}</span>
          <span className="profile-rc-label">RC Balance</span>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`profile-tab ${tab === 'stats' ? 'active' : ''}`}
          onClick={() => setTab('stats')}
        >
          Stats
        </button>
        <button
          className={`profile-tab ${tab === 'investments' ? 'active' : ''}`}
          onClick={() => setTab('investments')}
        >
          Investments
        </button>
      </div>

      {tab === 'stats' && (
        <div className="profile-stats-sections">
          <StatGroup title="Ideas">
            <StatCard label="Pitched" value={stats.ideasPitched} />
            <StatCard label="Fireproof'd" value={stats.ideasFireproof} accent="teal" />
            <StatCard label="Torched" value={stats.ideasTorched} accent="coral" />
          </StatGroup>
          <StatGroup title="Community">
            <StatCard label="Roasts Written" value={stats.roastsWritten} accent="coral" />
            <StatCard
              label="Defenses Written"
              value={stats.defensesWritten}
              accent="teal"
            />
          </StatGroup>
          <StatGroup title="Economy">
            <StatCard
              label="RC Invested"
              value={`${stats.totalRcInvested} RC`}
              accent="indigo"
            />
          </StatGroup>
        </div>
      )}
      {tab === 'investments' && <InvestmentHistory userId={id} />}
    </main>
  );
}
