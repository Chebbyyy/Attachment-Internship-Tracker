export function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 0 1 3.69 9c0-.59.1-1.17.26-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-line" />
      <span className="text-[12px] font-medium tracking-wide text-muted">or</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function SocialAuth() {
  return (
    <a
      href="/api/auth/google"
      className="flex w-full items-center justify-center gap-3 rounded-sm border border-line bg-surface px-4 py-2.5 text-[14px] font-medium text-ink transition-[border-color,background-color] duration-200 hover:border-ink hover:bg-paper"
    >
      <GoogleMark />
      Continue with Google
    </a>
  );
}

export function AuthSubmit({ children, busy, ...props }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full rounded-sm bg-ink py-2.5 text-[15px] font-semibold text-paper transition-[background-color,transform] duration-200 ease-out hover:bg-ink-soft active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      {children}
    </button>
  );
}
