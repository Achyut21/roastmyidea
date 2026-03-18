import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import IdeaCard from '../components/ideas/IdeaCard.jsx';
import FilterBar from '../components/ideas/FilterBar.jsx';
import SkeletonCard from '../components/shared/SkeletonCard.jsx';
import './BrowsePage.css';

export default function BrowsePage() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [sort, setSort] = useState('newest');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    document.title = 'Browse | RoastMyIdea';
  }, []);

  useEffect(() => {
    setLoading(true);
    setFetchError('');
    const params = new URLSearchParams({ sort });
    if (category) params.set('category', category);
    if (status) params.set('status', status);
    fetch(`/api/ideas?${params}`)
      .then((r) => r.json())
      .then((data) => setIdeas(data.ideas || []))
      .catch(() => setFetchError('Failed to load ideas'))
      .finally(() => setLoading(false));
  }, [sort, category, status]);

  return (
    <main className="main-content">
      <div className="browse-top">
        <h1 className="browse-title">Ideas</h1>
        {user ? (
          <Link to="/pitch" className="browse-pitch-btn">
            + Pitch Your Idea
          </Link>
        ) : (
          <Link to="/auth" className="browse-pitch-btn">
            Log in to Pitch
          </Link>
        )}
      </div>
      <FilterBar
        sort={sort}
        category={category}
        status={status}
        onSortChange={setSort}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
      />
      {loading && (
        <div className="browse-grid">
          {['a', 'b', 'c', 'd', 'e', 'f'].map((k) => (
            <SkeletonCard key={k} />
          ))}
        </div>
      )}
      {fetchError && <p className="browse-state browse-error">{fetchError}</p>}
      {!loading && !fetchError && ideas.length === 0 && (
        <div className="browse-empty-state">
          <p className="browse-empty-icon">🔍</p>
          <p className="browse-empty-title">No ideas found</p>
          <p className="browse-empty-sub">
            Try adjusting your filters or be the first to pitch one.
          </p>
          {user && (
            <Link
              to="/pitch"
              className="browse-pitch-btn"
              style={{ marginTop: 12 }}
            >
              Pitch Your Idea
            </Link>
          )}
        </div>
      )}
      {!loading && !fetchError && ideas.length > 0 && (
        <div className="browse-grid">
          {ideas.map((idea) => (
            <IdeaCard key={idea._id} idea={idea} />
          ))}
        </div>
      )}
    </main>
  );
}
