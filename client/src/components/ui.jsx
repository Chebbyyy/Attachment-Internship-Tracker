import { useState } from 'react';

export const inputClass =
  'w-full rounded-sm border border-line bg-surface px-2.5 py-[7px] text-[15px] leading-6 text-ink outline-none placeholder:text-muted/55 transition-[border-color] duration-200 ease-out focus:border-ink';

export function Card({ children, className = '' }) {
  return (
    <section className={`rounded-sm border border-line bg-surface p-5 transition-colors duration-300 ease-out hover:border-ink/20 ${className}`}>
      {children}
    </section>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      {label ? <span className="block text-[13px] font-medium text-ink">{label}</span> : null}
      {hint ? <span className="mt-0.5 block text-[12px] leading-4 text-muted">{hint}</span> : null}
      <span className={`block ${label || hint ? 'mt-1.5' : ''}`}>{children}</span>
    </label>
  );
}

export function TextInput({ className = '', ...props }) {
  return <input {...props} className={`${inputClass} ${className}`} />;
}

export function PasswordInput({ className = '', ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative block">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`${inputClass} pr-14 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-[12px] font-medium text-muted transition-colors duration-200 hover:text-ink"
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </span>
  );
}

export function TextArea({ className = '', ...props }) {
  return <textarea {...props} className={`${inputClass} min-h-[5.5rem] resize-y ${className}`} />;
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-ink text-paper hover:bg-ink-soft',
    ghost: 'bg-transparent text-ink-soft hover:bg-paper',
    quiet: 'bg-surface text-ink border border-line hover:border-ink',
  };
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-sm px-3.5 py-2 text-[13px] font-medium transition-[background-color,border-color,color,transform] duration-200 ease-out active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function ErrorText({ children }) {
  if (!children) return null;
  return <p className="flash-in border-l-2 border-clay pl-3 text-[13px] text-clay">{children}</p>;
}

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-[11px] text-muted">{eyebrow}</p> : null}
        <h1 className="font-display mt-1 text-3xl tracking-tight text-ink md:text-[2.15rem]">{title}</h1>
        {description ? <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
