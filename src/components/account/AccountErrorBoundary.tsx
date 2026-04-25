"use client";

import React from "react";

type State = { error: Error | null };

export default class AccountErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[account] render error", error, errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
        <h2 className="text-lg font-semibold text-red-900">Account page crashed</h2>
        <p className="mt-2">Please refresh and try again. We logged the client error for debugging.</p>
        <pre className="mt-4 overflow-auto rounded-lg bg-white/80 p-3 text-xs text-red-900">
          {this.state.error.stack || this.state.error.message}
        </pre>
        <button
          type="button"
          onClick={this.handleRetry}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
        >
          Refresh page
        </button>
      </section>
    );
  }
}
