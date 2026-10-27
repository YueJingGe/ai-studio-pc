import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children?: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="grid h-screen place-items-center p-8">
          <div className="max-w-md rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6">
            <h1 className="mb-2 text-lg font-semibold">页面出错了</h1>
            <p className="mb-4 break-all text-sm text-zinc-400">{this.state.error.message}</p>
            <button
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm"
              onClick={() => this.setState({ error: null })}
            >
              重试
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
