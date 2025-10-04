import React, { useState } from 'react';

interface LLABSelectorProps {
  onStart: (llabNumbers: number[], quizMode: 'mixed' | 'static_only' | 'ai_only') => void;
}

const LLABSelector: React.FC<LLABSelectorProps> = ({ onStart }) => {
  const [selectedLLABs, setSelectedLLABs] = useState<number[]>([]);
  const [quizMode, setQuizMode] = useState<'mixed' | 'static_only' | 'ai_only'>('mixed');

  const allLLABs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const toggleLLAB = (num: number) => {
    setSelectedLLABs(prev =>
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num].sort((a, b) => a - b)
    );
  };

  const selectAll = () => {
    setSelectedLLABs(allLLABs);
  };

  const clearAll = () => {
    setSelectedLLABs([]);
  };

  const handleStart = () => {
    if (selectedLLABs.length === 0) {
      alert('Please select at least one LLAB');
      return;
    }
    onStart(selectedLLABs, quizMode);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 120px)',
      padding: 'var(--spacing-xl)',
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: 'var(--bg-secondary)',
        padding: 'var(--spacing-xl)',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <h2 style={{
          color: 'var(--primary)',
          fontSize: '1.8rem',
          marginBottom: 'var(--spacing-lg)',
          textAlign: 'center',
        }}>
          Welcome to Lani Bot! 🪽
        </h2>

        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: 'var(--spacing-xl)',
          textAlign: 'center',
          lineHeight: 1.6,
        }}>
          Select the LLABs you want to focus on. Once started, you cannot change your selection without reloading the page.
        </p>

        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label style={{
            display: 'block',
            marginBottom: 'var(--spacing-sm)',
            fontWeight: '600',
            color: 'var(--text-primary)',
          }}>
            Select LLABs:
          </label>

          <div style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-md)',
          }}>
            <button
              onClick={selectAll}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-md)',
                background: 'var(--silver)',
                color: 'var(--blue-2)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.85rem',
                fontWeight: '500',
              }}
            >
              Select All
            </button>
            <button
              onClick={clearAll}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-md)',
                background: 'var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.85rem',
                fontWeight: '500',
              }}
            >
              Clear All
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'var(--spacing-sm)',
          }}>
            {allLLABs.map(num => (
              <button
                key={num}
                onClick={() => toggleLLAB(num)}
                style={{
                  padding: 'var(--spacing-md)',
                  background: selectedLLABs.includes(num) ? 'var(--primary)' : 'var(--bg-tertiary)',
                  color: selectedLLABs.includes(num) ? 'var(--text-light)' : 'var(--text-primary)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontWeight: selectedLLABs.includes(num) ? 'bold' : 'normal',
                  border: selectedLLABs.includes(num) ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  transition: 'var(--transition)',
                }}
              >
                LLAB {num}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <label style={{
            display: 'block',
            marginBottom: 'var(--spacing-sm)',
            fontWeight: '600',
            color: 'var(--text-primary)',
          }}>
            Quiz Mode:
          </label>

          <select
            value={quizMode}
            onChange={(e) => setQuizMode(e.target.value as 'mixed' | 'static_only' | 'ai_only')}
            style={{
              width: '100%',
              padding: 'var(--spacing-md)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '1rem',
            }}
          >
            <option value="mixed">Mixed (Static + AI Questions)</option>
            <option value="static_only">Static Questions Only</option>
            <option value="ai_only">AI-Generated Questions Only</option>
          </select>
        </div>

        <button
          onClick={handleStart}
          disabled={selectedLLABs.length === 0}
          style={{
            width: '100%',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            background: selectedLLABs.length > 0 ? 'var(--primary)' : 'var(--silver)',
            color: 'var(--text-light)',
            borderRadius: 'var(--border-radius)',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: selectedLLABs.length > 0 ? 'pointer' : 'not-allowed',
            opacity: selectedLLABs.length > 0 ? 1 : 0.5,
            transition: 'var(--transition)',
          }}
        >
          Start Study Session 🚀
        </button>

        {selectedLLABs.length > 0 && (
          <p style={{
            marginTop: 'var(--spacing-md)',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
          }}>
            Selected: {selectedLLABs.map(n => `LLAB ${n}`).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};

export default LLABSelector;
