import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import IdeaCard from '../components/ideas/IdeaCard.jsx';
import FilterBar from '../components/ideas/FilterBar.jsx';
import SkeletonCard from '../components/shared/SkeletonCard.jsx';
import './BrowsePage.css';

const PAGE_SIZE = 12;

async function fetchIdeas({ sort, category, status, searchQuery, cursor }) {
  const params = new URLSearchParams({ sort, limit: PAGE_SIZE });
  if (category) params.set('category', category);
  if (status) params.set('status', status);
  if (searchQuery) params.set('q', searchQuery);
  if (cursor && !searchQuery) {
    params.set('lastId', cursor.lastId);
    params.set('lastVal', cursor.lastVal);
  }
  const res = await fetch(`/api/ideas?${params}`);
  if (!res.ok) throw new Error('Failed to load ideas');
  return res.json();
}

export default function BrowsePage() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [sort, setSort] = useState('newest');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const cursorStack = useRef([null]);

  useEffect(() => {
    document.title = 'Browse | RoastMyIdea';
  }, []);

  // Reset and fetch page 1 whenever filters/search change
  useEffect(() => {
    cursorStack.current = [null];
    setPage(1);
    setLoading(true);
    setFetchError('');
    fetchIdeas({ sort, category, status, searchQuery, cursor: null })
      .then((data) => {
        setIdeas(data.ideas || []);
        setTotal(data.total || 0);
        setHasNext(data.hasNext || false);
        if (data.hasNext && data.nextCursor) {
          cursorStack.current[1] = data.nextCursor;
        }
      })
      .catch(() => setFetchError('Failed to load ideas'))
      .finally(() => setLoading(false));
  }, [sort, category, status, searchQuery]);

  function goToPage(pageNum, cursor) {
    setLoading(true);
    setFetchError('');
    fetchIdeas({ sort, category, status, searchQuery, cursor })
      .then((data) => {
        setIdeas(data.ideas || []);
        setTotal(data.total || 0);
        setHasNext(data.hasNext || false);
        setPage(pageNum);
        if (data.hasNext && data.nextCursor) {
          cursorStack.current[pageNum] = data.nextCursor;
        }
      })
      .catch(() => setFetchError('Failed to load ideas'))
      .finally(() => setLoading(false));
  }

  function handleNext() {
    const cursor = cursorStack.current[page];
    if (cursor) goToPage(page + 1, cursor);
  }

  function handlePrev() {
    if (page <= 1) return;
    const cursor = cursorStack.current[page - 2] || null;
    goToPage(page - 1, cursor);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  }

  function clearSearch() {
    setSearchInput('');
    setSearchQuery('');
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="main-content">
      <section className="browse-hero">
        <div className="browse-hero-text">
          <h1 className="browse-hero-title">
            Pitch your idea.
            <br />
            The internet decides.
          </h1>
          <p className="browse-hero-sub">
            Submit your startup idea, get roasted or defended by the community, and see if
            it survives 7 days.
          </p>
        </div>
        {user ? (
          <Link to="/pitch" className="browse-pitch-btn">
            + Pitch Your Idea
          </Link>
        ) : (
          <Link to="/auth" className="browse-pitch-btn">
            Start Pitching
          </Link>
        )}
      </section>

      <div className="browse-divider" />

      <form className="search-bar" onSubmit={handleSearchSubmit}>
        <input
          type="search"
          className="search-input"
          placeholder="Search ideas..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            if (e.target.value === '') clearSearch();
          }}
          aria-label="Search ideas"
        />
        {searchInput && (
          <button
            type="button"
            className="search-clear"
            aria-label="Clear search"
            onClick={clearSearch}
          >
            <X size={14} aria-hidden="true" />
            <span className="visually-hidden">Clear search</span>
          </button>
        )}
        <button type="submit" className="search-submit">
          Search
        </button>
      </form>

      <div className="filter-row">
        <FilterBar
          sort={sort}
          category={category}
          status={status}
          onSortChange={setSort}
          onCategoryChange={setCategory}
          onStatusChange={setStatus}
        />
        {(sort !== 'newest' || category || status || searchQuery) && (
          <button
            className="clear-filters-btn"
            onClick={() => {
              setSort('newest');
              setCategory('');
              setStatus('');
              setSearchInput('');
              setSearchQuery('');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading && (
        <div className="browse-grid">
          {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'].map((k) => (
            <SkeletonCard key={k} />
          ))}
        </div>
      )}

      {fetchError && <p className="browse-state browse-error">{fetchError}</p>}

      {!loading && !fetchError && ideas.length === 0 && (
        <div className="browse-empty-state">
          <Search size={32} className="browse-empty-icon" aria-hidden="true" />
          <p className="browse-empty-title">No ideas found</p>
          <p className="browse-empty-sub">
            Try adjusting your filters or be the first to pitch one.
          </p>
          {user && (
            <Link to="/pitch" className="browse-pitch-btn" style={{ marginTop: 12 }}>
              Pitch Your Idea
            </Link>
          )}
        </div>
      )}

      {!loading && !fetchError && ideas.length > 0 && (
        <>
          <div className="browse-grid">
            {ideas.map((idea) => (
              <IdeaCard key={idea._id} idea={idea} />
            ))}
          </div>
          {!searchQuery && totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={handlePrev}
                disabled={page === 1}
              >
                <ChevronLeft size={16} aria-hidden="true" />
                Prev
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button className="pagination-btn" onClick={handleNext} disabled={!hasNext}>
                Next
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
          {searchQuery && (
            <p className="pagination-info" style={{ textAlign: 'center', marginTop: 24 }}>
              {total} result{total !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
            </p>
          )}
        </>
      )}
    </main>
  );
}
