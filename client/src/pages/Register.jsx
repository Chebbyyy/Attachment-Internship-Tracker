import { Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import { AuthSubmit, OrDivider, SocialAuth } from '../components/SocialAuth';
import { ErrorText, Field, PasswordInput, TextInput } from '../components/ui';

export default function Register() {
  const { user, register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    organization: '',
    attachmentStartDate: '',
    attachmentEndDate: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form, true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Create an account"
      subtitle="For attachees and interns. Set the dates, then check in."
      footer="Attache · personal progress tracker"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <ErrorText>{error}</ErrorText>
        <Field label="Full name">
          <TextInput value={form.name} onChange={(e) => update('name', e.target.value)} required />
        </Field>
        <Field label="Email">
          <TextInput type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
        </Field>
        <Field label="Password" hint="At least 8 characters, with a letter and a number.">
          <PasswordInput
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            required
            minLength={8}
          />
        </Field>
        <Field label="Organization" hint="Optional.">
          <TextInput value={form.organization} onChange={(e) => update('organization', e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date">
            <TextInput
              type="date"
              value={form.attachmentStartDate}
              onChange={(e) => update('attachmentStartDate', e.target.value)}
              required
            />
          </Field>
          <Field label="End date">
            <TextInput
              type="date"
              value={form.attachmentEndDate}
              onChange={(e) => update('attachmentEndDate', e.target.value)}
              required
            />
          </Field>
        </div>
        <AuthSubmit busy={busy}>{busy ? 'Creating account…' : 'Create account'}</AuthSubmit>
      </form>
      <div className="mt-5 space-y-4">
        <OrDivider />
        <SocialAuth />
        <p className="text-center text-[13px] text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-link hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
