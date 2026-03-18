import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import IdeaHeader from '../components/ideas/IdeaHeader.jsx';
import VerdictBadge from '../components/ideas/VerdictBadge.jsx';
import BackSection from '../components/backs/BackSection.jsx';
import './IdeaDetailPage.css';

export default function IdeaDetailPage() {
  const { id } = useParams();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/ideas/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.idea) setIdea(data.idea);
        else setError(data.error || 'Idea not found');
      })
      .catch(() => setError('Failed to load idea'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className="main-content"><p className="detail-state">Loading...</p></main>;
  if (error) return <main className="main-content"><p className="detail-state">{error}</p></main>;

  return (
    <main className="main-content detail-content">
      <IdeaHeader idea={idea} />
      <div className="detail-status-bar">
        <VerdictBadge verdict={idea.verdict} createdAt={idea.createdAt} />
        <div className="detail-stats">
          <span className="stat-roast">🔥 {idea.roastCount} Roasts</span>
          <span className="stat-defense">🛡️ {idea.defenseCount} Defenses</span>
          <span className="stat-rc">💰 {idea.totalRoastCoinInvested} RC Invested</span>
        </div>
      </div>
      <BackSection idea={idea} />
      <div className="roast-section-placeholder">
        <p>Roasts and defenses load here</p>
      </div>
    </main>
  );
}
