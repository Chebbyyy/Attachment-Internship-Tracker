import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../api/client';
import AuthShell from '../components/AuthShell';
import { AuthSubmit } from '../components/SocialAuth';
import { ErrorText, Field, PasswordInput, TextInput } from '../components/ui';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setDone('');
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const data = await api('/api/auth/forgot-password', {
        method: 'POST',
        body: { email, password },
        token: null,
      });
      setDone(data.message || 'Password updated.');
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter the email on the account and choose a new password."
      footer="Attache · personal progress tracker"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <ErrorText>{error}</ErrorText>
        {done ? <p className="text-[13px] text-forest">{done}</p> : null}
        <Field label="Email">
          <TextInput
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="New password" hint="At least 8 characters.">
          <PasswordInput
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </Field>
        <Field label="Confirm password">
          <PasswordInput
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
          />
        </Field>
        <AuthSubmit busy={busy}>{busy ? 'Saving…' : 'Update password'}</AuthSubmit>
      </form>
      <p className="mt-6 text-center text-[13px] text-muted">
        <Link to="/login" className="font-medium text-link hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
