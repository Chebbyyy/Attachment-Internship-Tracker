import { useEffect, useId, useMemo, useRef, useState } from 'react';

const W = 640;
const H = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };

export default function TickerChart({ points, className = 'h-52 w-full', tone = 'ink' }) {
  const pathRef = useRef(null);
  const [length, setLength] = useState(0);
  const uid = useId();

  const { path, area, last, min, max, labels } = useMemo(() => {
    const series = points?.length
      ? [{ date: 'start', value: 100 }, ...points]
      : [{ date: 'start', value: 100 }, { date: 'now', value: 100 }];
    const values = series.map((p) => p.value);
    let lo = Math.min(...values);
    let hi = Math.max(...values);
    if (lo === hi) {
      lo -= 1;
      hi += 1;
    }
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const x = (i) => PAD.left + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
    const y = (v) => PAD.top + ((hi - v) / (hi - lo)) * innerH;
    const line = series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
    const areaPath = `${line} L ${x(series.length - 1).toFixed(1)} ${PAD.top + innerH} L ${x(0).toFixed(1)} ${PAD.top + innerH} Z`;
    const lastPoint = series[series.length - 1];
    return {
      path: line,
      area: areaPath,
      last: { x: x(series.length - 1), y: y(lastPoint.value) },
      min: lo,
      max: hi,
      labels: [hi, Math.round((hi + lo) / 2), lo],
    };
  }, [points]);

  useEffect(() => {
    if (pathRef.current) setLength(pathRef.current.getTotalLength());
  }, [path]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label="Weekday log index">
      {labels.map((label) => {
        const innerH = H - PAD.top - PAD.bottom;
        const y = PAD.top + ((max - label) / (max - min)) * innerH;
        return (
          <g key={`${uid}-${label}`}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="currentColor" className="text-line" />
            <text
              x={PAD.left - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-muted font-num"
              fontSize="10"
            >
              {label}
            </text>
          </g>
        );
      })}
      <path d={area} className={tone === 'forest' ? 'fill-forest/10' : tone === 'clay' ? 'fill-clay/10' : 'fill-accent/10'} />
      <path
        ref={pathRef}
        d={path}
        fill="none"
        stroke="currentColor"
        className={`ticker-line ${
          tone === 'forest' ? 'text-forest' : tone === 'clay' ? 'text-clay' : 'text-accent'
        }`}
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ '--ticker-length': length }}
      />
      {last ? (
        <circle
          cx={last.x}
          cy={last.y}
          r="3.5"
          className={`ticker-dot ${
            tone === 'forest' ? 'fill-forest' : tone === 'clay' ? 'fill-clay' : 'fill-accent'
          }`}
        />
      ) : null}
    </svg>
  );
}
