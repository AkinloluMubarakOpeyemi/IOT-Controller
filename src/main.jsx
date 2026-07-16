import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { firebaseError } from './firebase/config';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {firebaseError ? (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-950 dark:bg-slate-950 dark:text-white">
        <div className="panel max-w-xl p-6">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">
            Firebase Setup Required
          </span>
          <h1 className="mt-2 text-2xl font-bold">Dashboard cannot start yet</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{firebaseError}</p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Create a local <code>.env</code> file from <code>.env.example</code>, paste your Firebase
            web app config, then restart the Vite server.
          </p>
        </div>
      </div>
    ) : (
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    )}
  </React.StrictMode>,
);
