import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Flame, Shield, Coins, ArrowLeft } from 'lucide-react';
import IdeaHeader from '../components/ideas/IdeaHeader.jsx';
import VerdictBadge from '../components/ideas/VerdictBadge.jsx';
import BackSection from '../components/backs/BackSection.jsx';
import RoastSection from '../components/roasts/RoastSection.jsx';
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
    <main className="main-content">
      <button className="detail-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={14} aria-hidden="true" />
        Back
      </button>

      <div className="detail-layout">
        <div className="detail-left">
          <IdeaHeader idea={idea} />
          <RoastSection
            idea={idea}
            onRoastCreated={() =>
              setIdea((prev) => ({ ...prev, roastCount: prev.roastCount + 1 }))
            }
          />
        </div>

        <aside className="detail-sidebar">
          <div className="detail-sidebar-inner">
            <div className="detail-verdict-row">
              <VerdictBadge verdict={idea.verdict} createdAt={idea.createdAt} />
            </div>
            <div className="detail-stats">
              <div className="detail-stat">
                <span className="detail-stat-value stat-roast">
                  <Flame size={15} aria-hidden="true" />
                  {idea.roastCount}
                </span>
                <span className="detail-stat-label">Roasts</span>
              </div>
              <div className="detail-stat">
                <span className="detail-stat-value stat-defense">
                  <Shield size={15} aria-hidden="true" />
                  {idea.defenseCount}
                </span>
                <span className="detail-stat-label">Defenses</span>
              </div>
              <div className="detail-stat">
                <span className="detail-stat-value stat-rc">
                  <Coins size={15} aria-hidden="true" />
                  {idea.totalRoastCoinInvested}
                </span>
                <span className="detail-stat-label">RC Invested</span>
              </div>
            </div>
            <BackSection idea={idea} />
          </div>
        </aside>
      </div>
    </main>
  );
}
