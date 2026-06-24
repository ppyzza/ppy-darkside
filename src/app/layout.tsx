import './globals.css';
import Link from 'next/link';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeSelector } from '@/components/ThemeSelector';
import { ClientSidebar } from '@/components/ClientSidebar';

export const metadata = {
  title: 'LocalStack OS',
  description: 'Windows XP Styled LocalStack Client',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <ThemeProvider>

        {/* Top Header */}
        <header style={{ 
          background: 'linear-gradient(to bottom, var(--app-title-gradient-start), var(--app-title-gradient-end))', 
          color: 'var(--app-title-text)', 
          padding: '8px 12px',
          borderBottom: '1px solid var(--app-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>LocalStack OS</span>
            <span style={{ fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '3px' }}>Build 1.0 Beta</span>
          </div>
          <div style={{ fontSize: '11px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>Environment: Local Development</span>
            <ThemeSelector />
          </div>
        </header>

        {/* Main Workspace */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '12px', gap: '12px' }}>
          
          {/* Sidebar */}
          <ClientSidebar />

          {/* Main Content Area */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {children}
          </main>

        </div>

        {/* Status Bar */}
        <footer style={{ 
          background: 'var(--app-bg)', 
          borderTop: '1px solid var(--app-border)', 
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 -1px 0 var(--app-border)',
          padding: '4px 12px',
          display: 'flex',
          fontSize: '11px',
          gap: '16px',
          alignItems: 'center',
          color: 'var(--app-text)'
        }}>
          <div style={{ flex: 1, borderRight: '1px solid var(--app-border)', paddingRight: '8px' }}>Ready</div>
          <div style={{ display: 'flex', gap: '12px', borderRight: '1px solid var(--app-border)', paddingRight: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, background: 'var(--app-success)', borderRadius: '50%' }}></div> S3 Online</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, background: 'var(--app-success)', borderRadius: '50%' }}></div> SQS Online</span>
          </div>
          <div>Connected: localhost:4566</div>
        </footer>

        </ThemeProvider>
      </body>
    </html>
  );
}
