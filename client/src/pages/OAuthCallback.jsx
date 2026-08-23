import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const { completeSession } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    completeSession()
      .then(() => navigate('/', { replace: true }))
      .catch((err) => setError(err.message || 'Google sign-in failed.'));
  }, [completeSession, navigate]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper text-sm text-muted">
      {error || 'Signing you in…'}
    </div>
  );
}
