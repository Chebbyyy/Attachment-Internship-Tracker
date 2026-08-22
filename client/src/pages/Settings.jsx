import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Button, Card, ErrorText, Field, PageHeader, TextInput } from '../components/ui';

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

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Your dates"
        description="Start and end of the attachment or internship. These drive days remaining and consistency."
      />
      <Card className="max-w-xl">
        <form onSubmit={onSubmit} className="space-y-4">
          <ErrorText>{error}</ErrorText>
          {saved ? <p className="rounded-xl bg-forest-soft px-3 py-2 text-sm text-forest">{saved}</p> : null}
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
    </div>
  );
}
