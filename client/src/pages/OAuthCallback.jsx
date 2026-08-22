import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const { signInWithToken } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setError('Missing sign-in token.');
      return;
    }
    signInWithToken(token)
      .then(() => navigate('/', { replace: true }))
      .catch((err) => setError(err.message));
  }, [params, signInWithToken, navigate]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper text-sm text-muted">
      {error || 'Signing you in…'}
    </div>
  );
}
