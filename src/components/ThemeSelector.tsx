'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Monitor, Moon, Layers } from 'lucide-react';

export function ThemeSelector() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: '150px' }}></div>;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Theme:</label>
      <select 
        value={theme} 
        onChange={(e) => setTheme(e.target.value)}
        style={{
          background: 'var(--app-window-bg)',
          color: 'var(--app-text)',
          border: '1px solid var(--app-border)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        <option value="xp">🪟 Windows XP (Classic)</option>
        <option value="darkside">🌑 Darkside (Modern)</option>
        <option value="glass">💎 Glassmorphism</option>
      </select>
    </div>
  );
}
