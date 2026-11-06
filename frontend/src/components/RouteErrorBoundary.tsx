import React from 'react';
import { useLocation } from 'react-router-dom';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render/runtime errors (including failed lazy chunk loads)
 * so one broken page never white-screens the whole app.
 */
class Boundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Page crashed:', error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-[#0149FD]/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-[#0149FD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0a0a0a] mb-3">
            This page ran into a problem
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-7">
            The rest of SentinelX still works. Reloading usually fixes it, and if it
            keeps happening the issue has been logged to the console.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 bg-[#111111] hover:bg-[#222222] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Reload page
            </button>
            <a
              href="/"
              className="px-5 py-2.5 border border-gray-200 hover:border-[#0149FD]/40 text-gray-600 text-sm font-semibold rounded-xl transition-colors"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Route-scoped wrapper: remounts (and clears the error) whenever the
 * pathname changes, so a failure on one page doesn't trap the user.
 */
export function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return <Boundary key={location.pathname}>{children}</Boundary>;
}