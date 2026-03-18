import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TitleBadges from '../components/profile/TitleBadges.jsx';
import ProfileStats from '../components/profile/ProfileStats.jsx';
import InvestmentHistory from '../components/backs/InvestmentHistory.jsx';
import { timeAgo } from '../utils/timeAgo.js';
import './ProfilePage.css';

export default function ProfilePage() {
  const { id } = useParams();
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

  return (
    <main className="main-content profile-page">
      <div className="profile-header">
        <div>
          <h1 className="profile-name">{profile.displayName}</h1>
          <p className="profile-joined">Joined {timeAgo(profile.createdAt)}</p>
        </div>
        <TitleBadges
          roaster={profile.titles.roaster}
          defender={profile.titles.defender}
          pitcher={profile.titles.pitcher}
        />
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
        <ProfileStats
          stats={{
            ...profile.stats,
            roastCoinBalance: profile.roastCoinBalance,
          }}
        />
      )}
      {tab === 'investments' && <InvestmentHistory userId={id} />}
    </main>
  );
}
