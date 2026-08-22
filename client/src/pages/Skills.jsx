import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Card, ErrorText, PageHeader } from '../components/ui';
import { formatShort } from '../lib/dates';

export default function Skills() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api('/api/skills/summary')
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <ErrorText>{error}</ErrorText>;
  if (!data) return <p className="text-sm text-muted">Gathering skills…</p>;

  const list = data.skills.filter((s) => filter === 'all' || s.category === filter);
  const tech = data.counts.technical;
  const soft = data.counts.interpersonal;
  const total = data.total || 1;
  const techDeg = (tech / total) * 360;

  return (
    <div>
      <PageHeader
        eyebrow="Skills evidence"
        title="What you’ve actually practiced."
        description="A running record you can reuse later — not a wish list. Technical and interpersonal, side by side."
      />

      <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <Card className="flex flex-col items-center justify-center py-8">
          <div
            className="h-44 w-44 rounded-full"
            style={{
              background:
                data.total === 0
                  ? 'conic-gradient(#e4e0eb 0 360deg)'
                  : `conic-gradient(#6e4c9a 0 ${techDeg}deg, #3d6b5a ${techDeg}deg 360deg)`,
              mask: 'radial-gradient(circle, transparent 54%, black 55%)',
              WebkitMask: 'radial-gradient(circle, transparent 54%, black 55%)',
            }}
            aria-hidden
          />
          <div className="mt-4 flex gap-6 text-sm">
            <Legend color="#6e4c9a" label="Technical" value={tech} />
            <Legend color="#3d6b5a" label="Interpersonal" value={soft} />
          </div>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Balance</p>
          <p className="font-num mt-2 text-4xl tracking-tight">
            {data.total === 0 ? '—' : `${data.technicalPct} / ${data.interpersonalPct}`}
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
            Aim for both. Systems work is incomplete without the conversations that move it forward.
          </p>
        </Card>
      </div>

      <div className="mt-6 flex gap-2">
        {[
          ['all', 'All'],
          ['technical', 'Technical'],
          ['interpersonal', 'Interpersonal'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              filter === id ? 'bg-ink text-paper' : 'bg-surface text-muted ring-1 ring-line'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No skills tagged yet. Add them during daily check-in.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {list.map((skill) => (
            <li key={`${skill.skillName}-${skill.category}`} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-medium">{skill.skillName}</p>
                <p className="text-xs capitalize text-muted">{skill.category}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-num text-[15px]">{skill.timesLogged}×</p>
                <p className="text-xs text-muted">Last {formatShort(skill.lastPracticed)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Legend({ color, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      <span>
        {label} <span className="font-num text-muted">({value})</span>
      </span>
    </div>
  );
}
