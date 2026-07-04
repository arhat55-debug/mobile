import { Component, type ReactNode } from "react";
import { ErrorState } from "./ui";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("Uncaught error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-2xl px-5 py-24">
          <ErrorState
            message={this.state.message || "Санамсаргүй алдаа гарлаа."}
            onRetry={() => this.setState({ hasError: false, message: "" })}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
