import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

import { LanguageProvider } from './lib/i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <LanguageProvider>
                <App />
            </LanguageProvider>
        </ErrorBoundary>
    </React.StrictMode>,
);

// Remove Preload loader
window.postMessage({ payload: 'removeLoading' }, '*');
