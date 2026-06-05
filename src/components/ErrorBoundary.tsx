"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** Nom du composant pour les logs */
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const label = this.props.name ?? "composant";
    console.error(`[ErrorBoundary:${label}]`, error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "200px",
            padding: "24px",
            gap: "12px",
            background: "rgba(0,0,0,0.4)",
            borderRadius: "16px",
            border: "1px solid rgba(212,175,55,0.15)",
            fontFamily: "var(--font-dm-sans, sans-serif)",
          }}
        >
          <p
            style={{
              color: "rgba(248,244,236,0.5)",
              fontSize: "13px",
              textAlign: "center",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {this.props.name
              ? `Impossible de charger ${this.props.name}.`
              : "Ce composant n'a pas pu se charger."}
          </p>
          <button
            onClick={this.reset}
            style={{
              height: "40px",
              paddingInline: "20px",
              borderRadius: "20px",
              background: "#055C3F",
              border: "none",
              color: "#F8F4EC",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
