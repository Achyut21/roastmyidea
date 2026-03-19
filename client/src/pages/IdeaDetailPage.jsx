import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Flame, Shield, Coins, ArrowLeft } from 'lucide-react';
import IdeaHeader from '../components/ideas/IdeaHeader.jsx';
import VerdictBadge from '../components/ideas/VerdictBadge.jsx';
import BackSection from '../components/backs/BackSection.jsx';
import './IdeaDetailPage.css';

export default function IdeaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/ideas/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.idea) {
          setIdea(data.idea);
          document.title = `${data.idea.title} | RoastMyIdea`;
        } else {
          setError(data.error || 'Idea not found');
        }
      })
      .catch(() => setError('Failed to load idea'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <main className="main-content">
        <p className="detail-state">Loading...</p>
      </main>
    );
  if (error)
    return (
      <main className="main-content">
        <p className="detail-state">{error}</p>
      </main>
    );

  return (
    <main className="main-content detail-content">
      <button className="detail-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={14} aria-hidden="true" />
        Back
      </button>
      <IdeaHeader idea={idea} />
      <div className="detail-status-bar">
        <VerdictBadge verdict={idea.verdict} createdAt={idea.createdAt} />
        <div className="detail-stats">
          <span className="stat-roast">
            <Flame size={15} aria-hidden="true" /> {idea.roastCount} Roasts
          </span>
          <span className="stat-defense">
            <Shield size={15} aria-hidden="true" /> {idea.defenseCount} Defenses
          </span>
          <span className="stat-rc">
            <Coins size={15} aria-hidden="true" /> {idea.totalRoastCoinInvested} RC
            Invested
          </span>
        </div>
      </div>
      <BackSection idea={idea} />
      {/* needs RoastSection */}
      <div className="roast-section-placeholder">
        <p>Roasts and defenses load here</p>
      </div>
    </main>
  );
}
