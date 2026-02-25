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
  componentDidCatch(error: any) {
    const message = error?.message || "Unexpected error";
    toast.error(message);
  }
  render() {
    return this.props.children;
  }
}
