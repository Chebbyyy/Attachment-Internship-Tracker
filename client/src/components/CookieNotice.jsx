import { useState } from 'react';

const KEY = 'attache.cookie-consent';

export default function CookieNotice() {
  const [open, setOpen] = useState(() => {
    try {
      return !localStorage.getItem(KEY);
    } catch {
      return false;
    }
  });

  if (!open) return null;

  function choose(value) {
    localStorage.setItem(KEY, value);
    setOpen(false);
  }

  return (
    <div className="cookie-notice pointer-events-none fixed inset-x-0 bottom-20 z-50 px-4 md:bottom-5 md:left-auto md:right-5 md:w-[22rem] md:px-0">
      <div className="pointer-events-auto border border-line bg-surface p-4">
        <p className="font-display text-lg tracking-tight">Cookies on Attache</p>
        <p className="mt-2 text-[13px] leading-5 text-muted">
          We can store a sign-in token on this device so you stay logged in, and we remember this choice.
          No ads. No third-party trackers.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => choose('rejected')}
            className="rounded-sm border border-line py-2 text-[13px] font-medium text-ink transition hover:border-ink"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => choose('accepted')}
            className="rounded-sm bg-ink py-2 text-[13px] font-medium text-paper transition hover:bg-ink-soft"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
