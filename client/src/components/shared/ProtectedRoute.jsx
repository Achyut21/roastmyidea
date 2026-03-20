import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import SkeletonCard from './SkeletonCard.jsx';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="main-content">
        <div className="browse-grid">
          {[1, 2, 3, 4, 5, 6].map((k) => (
            <SkeletonCard key={k} />
          ))}
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
