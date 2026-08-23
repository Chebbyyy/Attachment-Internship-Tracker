import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Button, Card, ErrorText, Field, PageHeader, PasswordInput, TextInput } from '../components/ui';

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    organization: user?.organization || '',
    attachmentStartDate: user?.attachmentStartDate || '',
    attachmentEndDate: user?.attachmentEndDate || '',
  });
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);

  const [exportError, setExportError] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSaved('');
    setBusy(true);
    try {
      const data = await api('/api/auth/profile', { method: 'PUT', body: form });
      setUser(data.user);
      setSaved('Profile updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onPassword(e) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSaved('');
    if (newPassword !== confirmPassword) {
      setPasswordError('The two new passwords do not match.');
      return;
    }
    setPasswordBusy(true);
    try {
      const data = await api('/api/auth/password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      });
      if (data.user) setUser(data.user);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSaved('Password updated. Other sessions are signed out.');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordBusy(false);
    }
  }

  async function onExport() {
    setExportError('');
    try {
      const data = await api('/api/auth/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attache-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err.message);
    }
  }

  async function onDelete(e) {
    e.preventDefault();
    setDeleteError('');
    setDeleteBusy(true);
    try {
      await api('/api/auth/account', {
        method: 'DELETE',
        body: { password: deletePassword, confirmEmail: deleteEmail },
      });
      await logout();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Your dates"
        description="Start and end of the attachment or internship. These drive days remaining and consistency."
      />
      <Card className="max-w-xl">
        <form onSubmit={onSubmit} className="space-y-4">
          <ErrorText>{error}</ErrorText>
          {saved ? <p className="rounded-sm bg-forest-soft px-3 py-2 text-sm text-forest">{saved}</p> : null}
          <Field label="Name">
            <TextInput value={form.name} onChange={(e) => update('name', e.target.value)} />
          </Field>
          <Field label="Organization" hint="Optional. Where you are attached or interning.">
            <TextInput
              value={form.organization}
              onChange={(e) => update('organization', e.target.value)}
              placeholder="Organisation"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date">
              <TextInput type="date" value={form.attachmentStartDate} onChange={(e) => update('attachmentStartDate', e.target.value)} />
            </Field>
            <Field label="End date">
              <TextInput type="date" value={form.attachmentEndDate} onChange={(e) => update('attachmentEndDate', e.target.value)} />
            </Field>
          </div>
          <p className="text-sm text-muted">{user?.email}</p>
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={busy}>
              Save
            </Button>
            <Button variant="ghost" onClick={logout}>
              Sign out
            </Button>
          </div>
        </form>
      </Card>

      <Card className="max-w-xl">
        <h2 className="font-display text-[1.35rem] tracking-tight">Password</h2>
        <p className="mt-1 text-[13px] text-muted">
          {user?.hasPassword
            ? 'Changing it signs out every other session.'
            : 'This account was created with Google. Set a password if you also want email sign-in.'}
        </p>
        <form onSubmit={onPassword} className="mt-4 space-y-4">
          <ErrorText>{passwordError}</ErrorText>
          {passwordSaved ? <p className="rounded-sm bg-forest-soft px-3 py-2 text-sm text-forest">{passwordSaved}</p> : null}
          {user?.hasPassword ? (
            <Field label="Current password">
              <PasswordInput
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </Field>
          ) : null}
          <Field label="New password" hint="At least 8 characters, with a letter and a number.">
            <PasswordInput
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </Field>
          <Field label="Confirm new password">
            <PasswordInput
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </Field>
          <Button type="submit" disabled={passwordBusy}>
            {passwordBusy ? 'Saving…' : user?.hasPassword ? 'Update password' : 'Set password'}
          </Button>
        </form>
      </Card>

      <Card className="max-w-xl">
        <h2 className="font-display text-[1.35rem] tracking-tight">Your data</h2>
        <p className="mt-1 text-[13px] text-muted">
          Download every check-in, weekly goal, and win as JSON. Keep a copy if you move on.
        </p>
        <ErrorText>{exportError}</ErrorText>
        <div className="mt-4">
          <Button variant="quiet" onClick={onExport}>
            Export JSON
          </Button>
        </div>
      </Card>

      <Card className="max-w-xl border-clay/40">
        <h2 className="font-display text-[1.35rem] tracking-tight">Delete account</h2>
        <p className="mt-1 text-[13px] text-muted">
          Permanently removes your logs, goals, and account from this server. This cannot be undone.
        </p>
        <form onSubmit={onDelete} className="mt-4 space-y-4">
          <ErrorText>{deleteError}</ErrorText>
          {user?.hasPassword ? (
            <Field label="Password">
              <PasswordInput
                autoComplete="current-password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
              />
            </Field>
          ) : (
            <Field label="Type your email to confirm">
              <TextInput
                type="email"
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
                required
              />
            </Field>
          )}
          <Button type="submit" variant="quiet" disabled={deleteBusy} className="text-clay">
            {deleteBusy ? 'Deleting…' : 'Delete everything'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
