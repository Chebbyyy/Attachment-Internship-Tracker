import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import { AuthSubmit, OrDivider, SocialAuth } from '../components/SocialAuth';
import { ErrorText, Field, PasswordInput, TextInput } from '../components/ui';

export default function Login() {
  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const fromOauth = params.get('error');
    if (!fromOauth) return;
    setError(fromOauth);
    navigate('/login', { replace: true, state: location.state });
  }, [params, navigate, location.state]);

  if (user) return <Navigate to={location.state?.from || '/'} replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login({ email, password }, remember);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to continue."
      footer="Attache · personal progress tracker"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <ErrorText>{error}</ErrorText>
        <Field label="Email">
          <TextInput
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Password">
          <PasswordInput
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-muted">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-3.5 w-3.5 rounded-sm border-line accent-ink"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-[13px] font-medium text-link hover:underline">
            Forgot password
          </Link>
        </div>
        <AuthSubmit busy={busy}>{busy ? 'Signing in…' : 'Sign in'}</AuthSubmit>
      </form>
      <div className="mt-5 space-y-4">
        <OrDivider />
        <SocialAuth />
        <p className="text-center text-[13px] text-muted">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-link hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
