import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { message: '' };
  }

  static getDerivedStateFromError(error) {
    return { message: error?.message || 'The page failed to render.' };
  }

  render() {
    if (this.state.message) {
      return (
        <div className="flex min-h-dvh flex-col justify-center bg-paper px-6 text-ink">
          <p className="font-display text-2xl tracking-tight">Attache hit a display error.</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted">{this.state.message}</p>
          <button
            type="button"
            className="mt-6 w-fit rounded-sm bg-ink px-4 py-2 text-[13px] font-medium text-paper"
            onClick={() => window.location.assign('/login')}
          >
            Reload login
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
