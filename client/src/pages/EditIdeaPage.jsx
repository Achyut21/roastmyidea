import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PitchForm from '../components/ideas/PitchForm.jsx';
import './PitchPage.css';
import './EditIdeaPage.css';

export default function EditIdeaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/ideas/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.idea) setIdea(data.idea);
        else setError('Idea not found');
      })
      .catch(() => setError('Failed to load idea'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleSuccess() {
    navigate(`/ideas/${id}`);
  }

  if (loading) return <main className="main-content"><p>Loading...</p></main>;
  if (error) return <main className="main-content"><p>{error}</p></main>;

  return (
    <main className="main-content pitch-page">
      <div className="edit-page-top">
        <h1 className="pitch-page-title">Edit Idea</h1>
        <Link to={`/ideas/${id}`} className="edit-cancel-link">Cancel</Link>
      </div>
      <PitchForm existingIdea={idea} onSuccess={handleSuccess} />
    </main>
  );
}
