function padRows(values, min = 3) {
  const next = values.map((v) => v ?? '');
  while (next.length < min) next.push('');
  if (next[next.length - 1] !== '') next.push('');
  return next;
}

export function LineRows({ values, onChange, placeholder, min = 3 }) {
  const rows = padRows(values, min);

  function update(index, value) {
    const next = rows.map((row, i) => (i === index ? value : row));
    onChange(next);
  }

  return (
    <ol className="divide-y divide-line border border-line">
      {rows.map((row, index) => (
        <li key={index} className="flex items-stretch">
          <span className="font-num w-8 shrink-0 border-r border-line bg-paper px-2 py-2 text-right text-[12px] text-muted">
            {index + 1}
          </span>
          <input
            value={row}
            onChange={(e) => update(index, e.target.value)}
            placeholder={index === 0 ? placeholder : ''}
            className="min-w-0 flex-1 bg-surface px-2.5 py-2 text-[15px] outline-none placeholder:text-muted/50"
          />
        </li>
      ))}
    </ol>
  );
}

export function FormSection({ n, title, aside, children }) {
  return (
    <section className="grid grid-cols-1 gap-3 border-t border-line py-6 sm:grid-cols-[8.5rem_1fr] sm:gap-8">
      <header className="sm:pt-1">
        <p className="font-num text-[11px] text-muted">{n}</p>
        <h2 className="mt-0.5 text-[13px] font-medium text-ink">{title}</h2>
        {aside ? <p className="mt-1 text-[12px] leading-4 text-muted">{aside}</p> : null}
      </header>
      <div>{children}</div>
    </section>
  );
}
