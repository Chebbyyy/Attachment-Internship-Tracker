import { Link } from 'react-router-dom';
import AuthShell from '../components/AuthShell';

export default function ForgotPassword() {
  return (
    <AuthShell
      title="Change it in Settings."
      subtitle="Attache does not reset a password from an email alone."
      footer="Attache · personal progress tracker"
    >
      <p className="text-[15px] leading-6 text-ink">
        Sign in, then open Settings and set a new password. That keeps anyone else from changing
        your account just by knowing your email.
      </p>
      <p className="mt-4 text-[14px] leading-6 text-muted">
        If you cannot sign in, create a new account or ask whoever runs this copy of Attache to
        reset it from the database.
      </p>
      <p className="mt-6 text-center text-[13px] text-muted">
        <Link to="/login" className="font-medium text-link hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
