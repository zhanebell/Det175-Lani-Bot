import React, { useState } from 'react';
import { AppState } from './types';
import LLABSelector from './components/LLABSelector';
import ChatInterface from './components/ChatInterface';
import './styles/theme.css';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    llabNumbers: [],
    quizMode: 'mixed',
    messages: [],
    isLoading: false,
    error: null,
    sessionStarted: false,
    theme: 'dark',
  });

  const startSession = (llabNumbers: number[], quizMode: 'mixed' | 'static_only' | 'ai_only') => {
    setState(prev => ({
      ...prev,
      llabNumbers,
      quizMode,
      sessionStarted: true,
      messages: [],
    }));
  };

  const toggleTheme = () => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  return (
    <div className="app-container" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <header style={{
        background: 'var(--secondary)',
        padding: 'var(--spacing-md) var(--spacing-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <h1 style={{ color: 'var(--text-light)', fontSize: '1.5rem', fontWeight: 'bold' }}>
            🪽 Lani Bot
          </h1>
          <span style={{ color: 'var(--silver)', fontSize: '0.9rem' }}>
            Detachment 175 Study Assistant
          </span>
        </div>
        <button
          onClick={toggleTheme}
          style={{
            width: '40px',
            height: '40px',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            fontSize: '1.2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          title={state.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {state.theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      <main style={{ flex: 1, overflow: 'hidden' }}>
        {!state.sessionStarted ? (
          <LLABSelector onStart={startSession} />
        ) : (
          <ChatInterface
            llabNumbers={state.llabNumbers}
            quizMode={state.quizMode}
          />
        )}
      </main>

      <footer style={{
        background: 'var(--secondary)',
        padding: 'var(--spacing-sm)',
        textAlign: 'center',
        color: 'var(--silver)',
        fontSize: '0.8rem',
      }}>
        <p>
          Reload page to change LLAB focus • No data is stored • Built for Det 175 cadets
        </p>
      </footer>
    </div>
  );
};

export default App;
