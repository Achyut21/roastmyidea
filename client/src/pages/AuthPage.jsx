import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm.jsx';
import RegisterForm from '../components/auth/RegisterForm.jsx';
import './AuthPage.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sign In | RoastMyIdea';
  }, []);

  function handleSuccess() {
    navigate('/');
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <button className="auth-back" onClick={() => navigate('/')}>
          <ArrowLeft size={15} aria-hidden="true" />
          Back
        </button>
        {isLogin ? (
          <LoginForm onSuccess={handleSuccess} />
        ) : (
          <RegisterForm onSuccess={handleSuccess} />
        )}
        <p className="auth-toggle">
          {isLogin ? (
            <>
              No account?{' '}
              <button className="auth-toggle-btn" onClick={() => setIsLogin(false)}>
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="auth-toggle-btn" onClick={() => setIsLogin(true)}>
                Log In
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
