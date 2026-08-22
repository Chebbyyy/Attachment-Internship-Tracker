import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { FormSection, LineRows } from '../components/FormFields';
import { Button, ErrorText, TextArea } from '../components/ui';
import { formatLong, todayISO, weekdayName } from '../lib/dates';

function splitSkills(list) {
  return {
    technical: (list || []).filter((s) => s.type === 'technical').map((s) => s.skill),
    interpersonal: (list || []).filter((s) => s.type === 'interpersonal').map((s) => s.skill),
  };
}

function joinSkills(technical, interpersonal) {
  return [
    ...technical.filter((s) => s.trim()).map((skill) => ({ skill: skill.trim(), type: 'technical' })),
    ...interpersonal.filter((s) => s.trim()).map((skill) => ({ skill: skill.trim(), type: 'interpersonal' })),
  ];
}

export default function CheckIn() {
  const date = todayISO();
  const isWeekend = weekdayName(date) === 'Saturday' || weekdayName(date) === 'Sunday';
  const [existing, setExisting] = useState(null);
  const [tasks, setTasks] = useState(['']);
  const [technical, setTechnical] = useState(['']);
  const [interpersonal, setInterpersonal] = useState(['']);
  const [win, setWin] = useState('');
  const [challenges, setChallenges] = useState('');
  const [followedUp, setFollowedUp] = useState(false);
  const [mood, setMood] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/api/logs?date=${date}`)
      .then((data) => {
        const log = data.items[0];
        if (!log) return;
        const skills = splitSkills(log.skillsPracticed);
        setExisting(log);
        setTasks(log.tasksCompleted?.length ? log.tasksCompleted : ['']);
        setTechnical(skills.technical.length ? skills.technical : ['']);
        setInterpersonal(skills.interpersonal.length ? skills.interpersonal : ['']);
        setWin((log.winsLog || [])[0] || '');
        setChallenges(log.challenges || '');
        setFollowedUp(Boolean(log.followedUpOnTasks));
        setMood(log.moodRating);
        setNotes(log.notes || '');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [date]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSaved('');
    setBusy(true);
    const payload = {
      date,
      tasksCompleted: tasks.map((t) => t.trim()).filter(Boolean),
      skillsPracticed: joinSkills(technical, interpersonal),
      winsLog: win.trim() ? [win.trim()] : [],
      challenges: challenges.trim(),
      moodRating: mood,
      followedUpOnTasks: followedUp,
      notes: notes.trim(),
    };
    try {
      if (existing) {
        const data = await api(`/api/logs/${existing.id}`, { method: 'PUT', body: payload });
        setExisting(data.log);
      } else {
        const data = await api('/api/logs', { method: 'POST', body: payload });
        setExisting(data.log);
      }
      setSaved('Saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="border-b border-ink pb-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-display text-[2rem] leading-none tracking-tight">Daily check-in</h1>
          <p className="text-[13px] text-muted">{formatLong(date)}</p>
        </div>
        {isWeekend ? (
          <p className="mt-3 text-[12px] text-muted">Weekend entries are kept, but streaks only count Monday–Friday.</p>
        ) : null}
      </header>

      <form onSubmit={onSubmit}>
        <div className="mt-5 space-y-4">
          <ErrorText>{error}</ErrorText>
          {saved ? <p className="text-[13px] text-forest">{saved}</p> : null}
        </div>

        <FormSection n="01" title="Work completed" aside="One item per line.">
          <LineRows values={tasks} onChange={setTasks} placeholder="What did you finish?" />
        </FormSection>

        <FormSection n="02" title="Skills" aside="Name what you actually used.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-[12px] text-muted">Technical</p>
              <LineRows values={technical} onChange={setTechnical} placeholder="e.g. MongoDB" min={3} />
            </div>
            <div>
              <p className="mb-1.5 text-[12px] text-muted">Interpersonal</p>
              <LineRows values={interpersonal} onChange={setInterpersonal} placeholder="e.g. stakeholder updates" min={3} />
            </div>
          </div>
        </FormSection>

        <FormSection n="03" title="Win & challenge">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[12px] text-muted">Win</span>
              <TextArea rows={4} value={win} onChange={(e) => setWin(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] text-muted">What was hard</span>
              <TextArea rows={4} value={challenges} onChange={(e) => setChallenges(e.target.value)} />
            </label>
          </div>
        </FormSection>

        <FormSection n="04" title="Follow-up">
          <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-5">
            <input
              type="checkbox"
              checked={followedUp}
              onChange={(e) => setFollowedUp(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded-sm border-line accent-ink"
            />
            <span>
              I asked what to take on next
              <span className="mt-0.5 block text-[12px] text-muted">Supervisor, mentor, or whoever assigns work.</span>
            </span>
          </label>
        </FormSection>

        <FormSection n="05" title="How the day felt" aside="Optional.">
          <fieldset className="flex flex-wrap items-center gap-x-1 gap-y-2">
            <legend className="sr-only">Mood from 1 low to 5 steady</legend>
            <span className="mr-2 text-[12px] text-muted">Low</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <label
                key={n}
                className={`font-num flex h-8 w-8 cursor-pointer items-center justify-center border text-[13px] ${
                  mood === n ? 'border-ink bg-ink text-paper' : 'border-line bg-surface text-ink-soft'
                }`}
              >
                <input
                  type="radio"
                  name="mood"
                  value={n}
                  checked={mood === n}
                  onChange={() => setMood(n)}
                  className="sr-only"
                />
                {n}
              </label>
            ))}
            <span className="ml-2 text-[12px] text-muted">Steady</span>
            {mood ? (
              <button
                type="button"
                onClick={() => setMood(null)}
                className="ml-3 text-[12px] text-muted underline decoration-line underline-offset-2 hover:text-ink"
              >
                Clear
              </button>
            ) : null}
          </fieldset>
        </FormSection>

        <FormSection n="06" title="Notes" aside="Optional.">
          <TextArea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormSection>

        <div className="flex items-center justify-between gap-4 border-t border-ink py-5">
          <p className="text-[12px] text-muted">{existing ? 'Editing today’s entry.' : 'Not saved yet.'}</p>
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving…' : existing ? 'Update' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
}
