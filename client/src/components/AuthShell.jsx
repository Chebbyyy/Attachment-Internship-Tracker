const VIDEO_SRC = '/media/consistency.mp4';
const POSTER_SRC = '/media/consistency-poster.jpg';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-2">
      <aside className="relative isolate hidden min-h-dvh overflow-hidden bg-ink lg:block">
        <img
          src={POSTER_SRC}
          alt=""
          className="auth-poster absolute inset-0 h-full w-full object-cover"
        />
        <video
          className="auth-video absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={POSTER_SRC}
          aria-hidden="true"
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-ink/55" />
        <div className="relative flex h-full min-h-dvh flex-col justify-end p-10 text-paper">
          <p className="font-display text-5xl leading-none tracking-tight">Attache</p>
          <p className="mt-6 max-w-sm font-display text-[1.65rem] leading-snug tracking-tight">
            For attachees and interns.
          </p>
          <p className="mt-3 max-w-sm text-[14px] leading-6 text-paper/75">
            Not motivation. The weekday habit: record the work, name a skill, come back tomorrow.
          </p>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col bg-surface">
        <div className="relative h-44 overflow-hidden bg-ink lg:hidden">
          <img src={POSTER_SRC} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <video
            className="auth-video absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={POSTER_SRC}
            aria-hidden="true"
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-ink/50" />
          <p className="absolute bottom-4 left-4 font-display text-3xl text-paper">Attache</p>
        </div>
        <div className="flex flex-1 items-start justify-center px-5 py-8 sm:px-8 lg:items-center lg:py-10">
          <div className="w-full max-w-[23.5rem]">
            <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-2 text-[13px] leading-5 text-muted">{subtitle}</p> : null}
            <div className="mt-6">{children}</div>
          </div>
        </div>
        {footer ? (
          <p className="px-5 pb-5 text-center text-[11px] leading-4 text-muted">{footer}</p>
        ) : null}
      </div>
    </div>
  );
}
