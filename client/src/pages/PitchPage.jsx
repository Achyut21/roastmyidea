import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PitchForm from '../components/ideas/PitchForm.jsx';
import './PitchPage.css';

export default function PitchPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Pitch an Idea | RoastMyIdea';
  }, []);

  function handleSuccess(ideaId) {
    navigate(`/ideas/${ideaId}`);
  }

  return (
    <main className="main-content pitch-page">
      <h1 className="pitch-page-title">Pitch Your Idea</h1>
      <PitchForm existingIdea={null} onSuccess={handleSuccess} />
    </main>
  );
}
