import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertTriangle size={28} />
              <h1 className="text-xl font-semibold">Oups, une erreur est survenue</h1>
            </div>
            <p className="text-gray-600 mb-4">
              Quelque chose s'est mal passé. Recharger la page devrait régler le
              problème.
            </p>
            <pre className="text-xs bg-gray-50 border border-gray-200 rounded p-3 mb-4 overflow-auto max-h-40 text-gray-700">
              {this.state.error.message}
            </pre>
            <button
              onClick={this.handleReload}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <RefreshCw size={18} />
              Recharger
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
