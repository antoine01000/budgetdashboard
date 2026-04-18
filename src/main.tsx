import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/Layout/Toaster';
import useAppStore from './store';
import { toast } from './store/useToastStore';
import './index.css';

// Toaste les erreurs globales du store (remplace le set({ error }) jamais affiche)
useAppStore.subscribe((state, prev) => {
  if (state.error && state.error !== prev.error) {
    toast.error(state.error);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
