import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Copy, RefreshCcw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ error, errorInfo });
        console.error('Uncaught error:', error, errorInfo);

        // Log to our new logger if possible
        window.electronAPI?.logError('React ErrorBoundary: ' + error.message, error.stack + '\n' + errorInfo.componentStack);
    }

    private handleCopy = () => {
        const text = `Error: ${this.state.error?.message}\n\nStack:\n${this.state.error?.stack}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack}`;
        navigator.clipboard.writeText(text);
        alert('Diagnostics copied to clipboard!');
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8 text-center">
                    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl w-full border border-red-100 flex flex-col items-center">
                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-black mb-2">Ein unerwarteter Fehler ist aufgetreten</h1>
                        <p className="text-muted-foreground mb-8">
                            Die App konnte diesen Bereich nicht laden. Bitte kopiere die Fehlerdetails für den Support.
                        </p>

                        <div className="w-full bg-slate-900 text-slate-50 p-4 rounded-xl text-left text-xs font-mono overflow-auto max-h-64 mb-6">
                            <div className="font-bold text-red-400 mb-2">{this.state.error?.toString()}</div>
                            <div className="whitespace-pre-wrap opacity-80">{this.state.errorInfo?.componentStack}</div>
                        </div>

                        <div className="flex gap-4 w-full">
                            <button
                                onClick={this.handleCopy}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 hover:bg-slate-50 transition-colors font-bold"
                            >
                                <Copy className="h-4 w-4" /> Diagnostics kopieren
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-bold"
                            >
                                <RefreshCcw className="h-4 w-4" /> App neu laden
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
