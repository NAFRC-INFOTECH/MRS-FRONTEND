import React from "react";
import { toast } from "sonner";

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export default class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    const message = error instanceof Error ? error.message : String(error ?? "Unexpected error");
    toast.error(message);
  }
  render() {
    return this.props.children;
  }
}
