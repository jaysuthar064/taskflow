import React, { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

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
        <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6">
          <div className="card glass max-w-lg w-full p-8 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 mb-2">Something went wrong</h1>
            <p className="text-surface-500 mb-8">
              An unexpected error occurred. We've been notified and are looking into it.
            </p>
            
            <div className="bg-surface-100 p-4 rounded-xl mb-8 text-left overflow-hidden">
                <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Error Details</p>
                <div className="text-sm font-mono text-red-600 break-words">
                    {this.state.errorMessage}
                </div>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="btn-primary w-full py-3 flex items-center justify-center space-x-2"
            >
              <RefreshCw size={18} />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
