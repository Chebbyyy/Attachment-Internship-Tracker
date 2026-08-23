import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import TickerChart from '../components/TickerChart';
import { Button, ErrorText } from '../components/ui';
import { formatLong, formatShort, weekdayName } from '../lib/dates';

const rail = {
  iris: 'border-l-accent',
  forest: 'border-l-forest',
  clay: 'border-l-clay',
};

function greet(name) {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Nairobi',
      hour: 'numeric',
      hour12: false,
    }).format(new Date())
  );
  const word = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${word}, ${name}`;
}

function Chip({ tone = 'muted', children }) {
  const styles = {
    iris: 'bg-accent-soft text-accent',
    forest: 'bg-forest-soft text-forest',
    clay: 'bg-clay-soft text-clay',
    muted: 'bg-paper text-muted',
  };
  return (
    <span className={`inline-block rounded-sm px-2 py-0.5 text-[11px] font-medium ${styles[tone]}`}>
      {children}
    </span>
  );
}

function BoardCol({ title, aside, delay, tone = 'iris', children }) {
  return (
    <section
      className={`overview-col flex min-h-[24rem] flex-col border border-line border-l-[3px] bg-surface p-5 transition-colors duration-300 hover:border-ink/20 ${rail[tone]}`}
      style={{ '--enter-delay': delay }}
    >
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[1.35rem] tracking-tight">{title}</h2>
        {aside}
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [skills, setSkills] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/api/dashboard'), api('/api/skills/summary')])
      .then(([dash, skill]) => {
        setData(dash);
        setSkills(skill);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <ErrorText>{error}</ErrorText>;
  if (!data) return <p className="text-sm text-muted">Opening overview…</p>;

  const firstName = user?.name?.split(' ')[0] || 'there';
  const week = data.week || {};
  const weekGoals = week.goals || [];
  const ticker = data.ticker || [];
  const last = ticker[ticker.length - 1];
  const prev = ticker[ticker.length - 2];
  const delta = last && prev ? last.value - prev.value : 0;
  const loggedDays = ticker.filter((point) => point.logged).length;
  const missedDays = ticker.length - loggedDays;
  const streak = data.streak?.current || 0;
  const todayTone = data.todayLogged ? 'forest' : data.todayIsWorkday ? 'iris' : 'muted';
  const tapeTone = delta > 0 ? 'forest' : delta < 0 ? 'clay' : 'iris';
  const status = [
    `Day ${data.daysIn} of ${data.daysIn + data.daysRemaining}`,
    streak > 0 ? `${streak}-day streak` : 'No streak yet',
  ].join(' · ');

  return (
    <div>
      <div className="overview-mast relative mb-6 overflow-hidden rounded-sm bg-ink">
        <img
          src="/media/consistency-poster.jpg"
          alt=""
          className="overview-mast-photo absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/60" />
        <div className="relative flex min-h-40 flex-col justify-end p-5 sm:min-h-44">
          <div className="text-paper">
            <p className="text-[11px] text-paper/70">{formatLong(data.today)}</p>
            <h1 className="font-display mt-1 text-3xl tracking-tight md:text-[2.1rem]">{greet(firstName)}</h1>
            <p className="mt-2 text-sm text-paper/75">{status}</p>
            {data.todayIsWorkday && !data.todayLogged ? (
              <p className="mt-3">
                <Chip tone="iris">Today still open</Chip>
              </p>
            ) : data.todayLogged ? (
              <p className="mt-3">
                <Chip tone="forest">Checked in</Chip>
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {data.todayLogged
            ? 'Today’s log is saved. Open it to change tasks or skills.'
            : 'Write today’s tasks, skills, and one win.'}
        </p>
        <Link to="/check-in">
          <Button>
            {data.todayLogged ? 'Open today’s check-in' : 'Record today’s work'}
          </Button>
        </Link>
      </div>

      <section
        className="overview-col mb-4 border border-line border-l-[3px] border-l-accent bg-surface p-5"
        style={{ '--enter-delay': '40ms' }}
      >
        <header className="mb-1 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[1.35rem] tracking-tight">Log index</h2>
            <p className="mt-1 text-[12px] text-muted">
              Starts at 100. Logged workday +1, missed workday −1.
            </p>
          </div>
          <div className="text-right">
            <p className="font-num text-3xl tracking-tight">{last ? last.value : 100}</p>
            <p
              className={`font-num text-[13px] ${
                delta > 0 ? 'text-forest' : delta < 0 ? 'text-clay' : 'text-muted'
              }`}
            >
              {delta > 0 ? `+${delta}` : delta < 0 ? delta : 'No change'}
            </p>
          </div>
        </header>
        <div className="mt-3">
          <TickerChart points={ticker} className="h-64 w-full" tone={tapeTone} />
        </div>
        <p className="mt-2 text-[12px] text-muted">
          {last
            ? `${last.consistency}% of elapsed workdays logged.`
            : 'Check in on a weekday and the line will move from 100.'}
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <BoardCol
          title="Today"
          tone={data.todayLogged ? 'forest' : 'iris'}
          aside={<Chip tone={todayTone === 'muted' ? 'muted' : todayTone}>{weekdayName(data.today)}</Chip>}
          delay="80ms"
        >
          <p className="text-sm leading-6 text-ink">
            {data.todayLogged
              ? 'Today’s check-in is in. You can still edit it.'
              : data.todayIsWorkday
                ? 'This workday is still open.'
                : 'Weekend — streaks hold. Check in if you worked.'}
          </p>
          <dl className="mt-5 divide-y divide-line border-y border-line text-sm">
            <div className="flex justify-between gap-3 py-2.5">
              <dt className="text-muted">Days in</dt>
              <dd className="font-num text-accent">{data.daysIn}</dd>
            </div>
            <div className="flex justify-between gap-3 py-2.5">
              <dt className="text-muted">Remaining</dt>
              <dd className="font-num">{data.daysRemaining}</dd>
            </div>
            <div className="flex justify-between gap-3 py-2.5">
              <dt className="text-muted">Streak</dt>
              <dd className={`font-num ${streak ? 'text-forest' : 'text-muted'}`}>{streak || '—'}</dd>
            </div>
          </dl>
          <div className="mt-auto pt-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-accent">Latest win</p>
            {data.latestWin ? (
              <p className="mt-2 text-sm leading-6">{data.latestWin.text}</p>
            ) : (
              <p className="mt-2 text-sm text-muted">None recorded yet.</p>
            )}
            <Link to="/wins" className="mt-3 inline-block text-sm font-medium text-accent hover:underline">
              All wins
            </Link>
          </div>
        </BoardCol>

        <BoardCol
          title="This week"
          tone="iris"
          aside={
            week.goalsTotal ? (
              <Chip tone="iris">
                {week.goalsCompleted}/{week.goalsTotal}
              </Chip>
            ) : (
              <span className="font-num text-[12px] text-muted">
                {week.weekStartDate ? formatShort(week.weekStartDate) : 'This week'}
              </span>
            )
          }
          delay="160ms"
        >
          {week.needsGoals || !weekGoals.length ? (
            <p className="text-sm text-muted">Set this week’s goals.</p>
          ) : (
            <ul>
              {weekGoals.map((goal, i) => (
                <li
                  key={`${goal.text}-${i}`}
                  className="overview-row flex items-start gap-3 border-b border-line py-2.5 text-sm"
                  style={{ '--enter-delay': `${220 + i * 70}ms` }}
                >
                  <span className={`font-num w-5 shrink-0 ${goal.done ? 'text-forest' : 'text-accent'}`}>
                    {i + 1}
                  </span>
                  <span className={goal.done ? 'text-muted line-through' : 'text-ink'}>{goal.text}</span>
                </li>
              ))}
            </ul>
          )}
          {week.needsReflection ? (
            <p className="mt-4 text-sm text-clay">Week’s end — add a short reflection.</p>
          ) : null}
          <p className="mt-5 text-sm">
            <span className="font-num text-accent">{skills?.counts.technical ?? 0}</span>
            <span className="text-muted"> technical · </span>
            <span className="font-num text-forest">{skills?.counts.interpersonal ?? 0}</span>
            <span className="text-muted"> interpersonal</span>
          </p>
          <div className="mt-auto flex gap-4 pt-5 text-sm font-medium">
            <Link to="/goals" className="text-accent hover:underline">
              Weekly planning
            </Link>
            <Link to="/skills" className="text-muted hover:text-accent hover:underline">
              Skills
            </Link>
          </div>
        </BoardCol>

        <BoardCol
          title="Tape"
          tone={tapeTone}
          aside={<Chip tone={tapeTone}>{last ? `${last.consistency}%` : '100'}</Chip>}
          delay="240ms"
        >
          <p className="font-num text-3xl tracking-tight">{last ? last.value : 100}</p>
          <p
            className={`mt-1 font-num text-[15px] ${
              delta > 0 ? 'text-forest' : delta < 0 ? 'text-clay' : 'text-muted'
            }`}
          >
            {delta > 0 ? `+${delta}` : delta < 0 ? delta : 'No change today'}
          </p>
          <dl className="mt-5 divide-y divide-line border-y border-line text-sm">
            <div className="flex justify-between gap-3 py-2.5">
              <dt className="text-muted">Logged</dt>
              <dd className="font-num text-forest">{loggedDays}</dd>
            </div>
            <div className="flex justify-between gap-3 py-2.5">
              <dt className="text-muted">Missed</dt>
              <dd className={`font-num ${missedDays ? 'text-clay' : 'text-muted'}`}>{missedDays}</dd>
            </div>
            <div className="flex justify-between gap-3 py-2.5">
              <dt className="text-muted">Consistency</dt>
              <dd className="font-num">{last ? `${last.consistency}%` : '—'}</dd>
            </div>
          </dl>
          <p className="mt-auto pt-5 text-[12px] leading-5 text-muted">
            The graph above tracks the same weekday index.
          </p>
        </BoardCol>
      </div>
    </div>
  );
}
