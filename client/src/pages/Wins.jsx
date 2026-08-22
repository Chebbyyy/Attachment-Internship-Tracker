import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { Button, Card, ErrorText, PageHeader, TextInput } from '../components/ui';
import { formatLong } from '../lib/dates';

export default function Wins() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    api('/api/logs?winsOnly=true&limit=100')
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message));
  }, []);

  const wins = useMemo(() => {
    const rows = items.flatMap((log) =>
      (log.winsLog || []).map((text) => ({ date: log.date, text, id: `${log.id}-${text}` }))
    );
    const q = query.trim().toLowerCase();
    return q ? rows.filter((row) => row.text.toLowerCase().includes(q) || row.date.includes(q)) : rows;
  }, [items, query]);

  function exportText(asMarkdown) {
    const lines = asMarkdown
        ? ['# Placement wins', '', ...wins.map((w) => `- **${w.date}** — ${w.text}`)]
      : wins.map((w) => `${w.date} — ${w.text}`);
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = asMarkdown ? 'attache-wins.md' : 'attache-wins.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Wins"
        title="Keep the evidence."
        description="A chronological feed of every win you recorded — ready to drop into a report, portfolio, or review."
        action={
          <div className="flex gap-2">
            <Button variant="quiet" onClick={() => exportText(false)} disabled={!wins.length}>
              Export .txt
            </Button>
            <Button onClick={() => exportText(true)} disabled={!wins.length}>
              Export .md
            </Button>
          </div>
        }
      />

      <TextInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter by keyword or date…"
        className="mb-4"
      />

      <ErrorText>{error}</ErrorText>

      {wins.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">No wins yet. Add one during today’s check-in — even a small one.</p>
        </Card>
      ) : (
        <ol className="space-y-3">
          {wins.map((win) => (
            <li key={win.id}>
              <Card>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{formatLong(win.date)}</p>
                <p className="mt-2 text-[15px] leading-relaxed">{win.text}</p>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
