import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm.jsx';
import RegisterForm from '../components/auth/RegisterForm.jsx';
import './AuthPage.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  function handleSuccess() {
    navigate('/');
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
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
    </div>
  );
}
