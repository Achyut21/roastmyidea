import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import IdeaCard from '../components/ideas/IdeaCard.jsx';
import FilterBar from '../components/ideas/FilterBar.jsx';
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
          <Link to="/pitch" className="browse-pitch-btn">+ Pitch Your Idea</Link>
        ) : (
          <Link to="/auth" className="browse-pitch-btn">Log in to Pitch</Link>
        )}
      </div>
      <FilterBar sort={sort} category={category} status={status}
        onSortChange={setSort} onCategoryChange={setCategory} onStatusChange={setStatus} />
      {loading && <p className="browse-state">Loading...</p>}
      {fetchError && <p className="browse-state browse-error">{fetchError}</p>}
      {!loading && !fetchError && ideas.length === 0 && (
        <p className="browse-state">No ideas match your filters.</p>
      )}
      {!loading && !fetchError && ideas.length > 0 && (
        <div className="browse-grid">
          {ideas.map((idea) => <IdeaCard key={idea._id} idea={idea} />)}
        </div>
      )}
    </main>
  );
}
