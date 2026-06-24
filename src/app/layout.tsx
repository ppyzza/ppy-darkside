import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'LocalStack OS',
  description: 'Windows XP Styled LocalStack Client',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <header style={{ 
          background: 'linear-gradient(to bottom, #0058e6, #3a93ff)', 
          color: 'white', 
          padding: '8px 12px',
          borderBottom: '1px solid #000',
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
          <div style={{ fontSize: '11px', display: 'flex', gap: '16px' }}>
            <span>Environment: Local Development</span>
          </div>
        </header>

        {/* Main Workspace */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '12px', gap: '12px' }}>
          
          {/* Sidebar */}
          <aside style={{ width: '220px', display: 'flex', flexDirection: 'column' }} className="window-panel">
            <div style={{ background: '#0A246A', color: 'white', padding: '2px 6px', fontSize: '11px', fontWeight: 'bold' }}>
              Dashboard
            </div>
            
            <div style={{ flex: 1, padding: '8px', background: '#FFFFFF', border: '1px solid #7F9DB9', overflowY: 'auto' }}>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '4px' }}>[-] Storage</div>
                <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Link href="/" style={{ color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#E5C365' }}>📁</span> S3 Explorer
                  </Link>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '4px' }}>[-] Messaging</div>
                <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Link href="/sqs" style={{ color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#E5C365' }}>📁</span> SQS Manager
                  </Link>
                  <Link href="#" style={{ color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.5 }}>
                    <span style={{ color: '#E5C365' }}>📁</span> SNS Topics
                  </Link>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '4px' }}>[+] Intelligence</div>
                <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Link href="/knowledge" style={{ color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#E5C365' }}>🧠</span> Knowledge Graph
                  </Link>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '4px' }}>[-] Accessories</div>
                <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Link href="/seed-wizard" style={{ color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#E5C365' }}>🪄</span> CSV to Seed Wizard
                  </Link>
                  <Link href="/config-compare" style={{ color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#E5C365' }}>⚙️</span> Config Checker
                  </Link>
                  <Link href="/tenant-compare" style={{ color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#E5C365' }}>🏢</span> Tenant Checker
                  </Link>
                  <Link href="/db-diff" style={{ color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#E5C365' }}>⚖️</span> Database Diff Wizard
                  </Link>
                  <Link href="/terragrunt" style={{ color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#E5C365' }}>🌍</span> Terragrunt Inspector
                  </Link>
                  <Link href="/utilities" style={{ color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#E5C365' }}>🧰</span> PowerToys
                  </Link>
                  <Link href="/sqs" style={{ color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#E5C365' }}>🚀</span> SQS Simulator
                  </Link>
                </div>
              </div>

            </div>
          </aside>

          {/* Main Content Area */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {children}
          </main>

        </div>

        {/* Status Bar */}
        <footer style={{ 
          background: 'var(--xp-bg)', 
          borderTop: '1px solid #FFFFFF', 
          boxShadow: 'inset 0 1px 0 #ACA899, 0 -1px 0 #7F9DB9',
          padding: '2px 8px',
          display: 'flex',
          fontSize: '11px',
          gap: '16px',
          alignItems: 'center',
          color: '#000'
        }}>
          <div style={{ flex: 1, borderRight: '1px solid #ACA899', paddingRight: '8px', boxShadow: '1px 0 0 #FFFFFF' }}>Ready</div>
          <div style={{ display: 'flex', gap: '12px', borderRight: '1px solid #ACA899', paddingRight: '8px', boxShadow: '1px 0 0 #FFFFFF' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, background: 'var(--xp-success)', borderRadius: '50%' }}></div> S3 Online</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, background: 'var(--xp-success)', borderRadius: '50%' }}></div> SQS Online</span>
          </div>
          <div>Connected: localhost:4566</div>
        </footer>

      </body>
    </html>
  );
}
