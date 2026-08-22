import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Button, Card, ErrorText, PageHeader, TextArea, TextInput } from '../components/ui';
import { formatShort } from '../lib/dates';

const blankGoals = () => [
  { text: '', done: false },
  { text: '', done: false },
  { text: '', done: false },
];

export default function Goals() {
  const [week, setWeek] = useState(null);
  const [meta, setMeta] = useState(null);
  const [goals, setGoals] = useState(blankGoals());
  const [reflection, setReflection] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const data = await api('/api/goals?current=true');
    setMeta({ weekStartDate: data.weekStartDate, weekEndDate: data.weekEndDate });
    if (data.week) {
      setWeek(data.week);
      setGoals(data.week.goals);
      setReflection(data.week.reflection || '');
    } else {
      setWeek(null);
      setGoals(blankGoals());
      setReflection('');
    }
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  function updateGoal(index, patch) {
    setGoals((prev) => prev.map((goal, i) => (i === index ? { ...goal, ...patch } : goal)));
  }

  function addGoal() {
    if (goals.length >= 5) return;
    setGoals((prev) => [...prev, { text: '', done: false }]);
  }

  function removeGoal(index) {
    if (goals.length <= 3) return;
    setGoals((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveGoals(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const payload = { goals: goals.filter((g) => g.text.trim()) };
    try {
      if (week) {
        const data = await api(`/api/goals/${week.id}`, { method: 'PUT', body: payload });
        setWeek(data.week);
        setGoals(data.week.goals);
      } else {
        const data = await api('/api/goals', { method: 'POST', body: payload });
        setWeek(data.week);
        setGoals(data.week.goals);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleDone(index) {
    if (!week) return;
    const next = goals.map((goal, i) => (i === index ? { ...goal, done: !goal.done } : goal));
    setGoals(next);
    try {
      const data = await api(`/api/goals/${week.id}`, { method: 'PUT', body: { goals: next } });
      setWeek(data.week);
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveReflection() {
    if (!week) return;
    setBusy(true);
    try {
      const data = await api(`/api/goals/${week.id}`, { method: 'PUT', body: { reflection } });
      setWeek(data.week);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const filled = goals.filter((g) => g.text.trim());
  const doneCount = filled.filter((g) => g.done).length;
  const pct = filled.length ? Math.round((doneCount / filled.length) * 100) : 0;

  return (
    <div>
      <PageHeader
        eyebrow="Weekly planning"
        title="Name the week."
        description={
          meta
            ? `${formatShort(meta.weekStartDate)} – ${formatShort(meta.weekEndDate)}. Three to five goals. Reflect before Monday arrives.`
            : 'Set 3–5 goals, then close the week with a short reflection.'
        }
      />

      <ErrorText>{error}</ErrorText>

      {week ? (
        <Card className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Progress</span>
            <span className="font-num text-[13px]">
              {doneCount} / {filled.length} · {pct}%
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper">
            <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-2xl">{week ? 'This week’s goals' : 'Set this week’s goals'}</h2>
          <form onSubmit={saveGoals} className="mt-4 space-y-3">
            {goals.map((goal, index) => (
              <div key={goal.id || index} className="flex items-center gap-2">
                {week ? (
                  <input
                    type="checkbox"
                    checked={goal.done}
                    onChange={() => toggleDone(index)}
                    className="h-4 w-4 accent-accent"
                  />
                ) : null}
                <TextInput
                  value={goal.text}
                  onChange={(e) => updateGoal(index, { text: e.target.value })}
                  placeholder={`Goal ${index + 1}`}
                />
                {goals.length > 3 ? (
                  <button type="button" onClick={() => removeGoal(index)} className="text-xs text-muted">
                    Remove
                  </button>
                ) : null}
              </div>
            ))}
            {goals.length < 5 ? (
              <button type="button" onClick={addGoal} className="text-sm font-medium text-accent">
                Add another goal
              </button>
            ) : null}
            <div className="pt-6">
              <Button type="submit" disabled={busy}>
                {week ? 'Save changes' : 'Save week'}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="font-display text-2xl">End-of-week reflection</h2>
          <p className="mt-1 text-sm text-muted">What worked. What to improve. Keep it short enough to actually write.</p>
          <TextArea
            rows={8}
            className="mt-4"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="This week I…"
            disabled={!week}
          />
          <Button className="mt-4" onClick={saveReflection} disabled={!week || busy}>
            Save reflection
          </Button>
        </Card>
      </div>
    </div>
  );
}
