import React, { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "Unknown error",
    };
  }

  componentDidCatch(error, info) {
    console.error("Application error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-xl w-full bg-white border border-red-200 rounded-lg shadow p-6">
            <h1 className="text-xl font-semibold text-red-600">App crashed</h1>
            <p className="mt-2 text-sm text-gray-700">
              Please refresh the page. If this continues, share this error:
            </p>
            <pre className="mt-4 text-xs bg-gray-100 p-3 rounded overflow-x-auto whitespace-pre-wrap">
              {this.state.errorMessage}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
