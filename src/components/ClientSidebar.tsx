'use client';

import { useState } from 'react';
import Link from 'next/link';

export function ClientSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside style={{ 
      width: isCollapsed ? '44px' : '220px', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'width 0.2s ease-in-out',
      overflow: 'hidden',
      flexShrink: 0
    }} className="window-panel">
      <div 
        className="sidebar-header" 
        style={{ 
          display: 'flex', 
          justifyContent: isCollapsed ? 'center' : 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          padding: isCollapsed ? '4px' : undefined
        }} 
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {!isCollapsed && <span>Dashboard</span>}
        <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{isCollapsed ? '≡' : '«'}</span>
      </div>
      
      <div style={{ 
        flex: 1, 
        padding: isCollapsed ? '8px 4px' : '8px', 
        background: 'var(--app-window-bg)', 
        border: '1px solid var(--app-border)', 
        borderTop: 'none', 
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        
        <SidebarGroup title="Storage" isCollapsed={isCollapsed}>
          <SidebarLink href="/" icon="📁" label="S3 Explorer" isCollapsed={isCollapsed} />
        </SidebarGroup>

        <SidebarGroup title="Messaging" isCollapsed={isCollapsed}>
          <SidebarLink href="/sqs" icon="📁" label="SQS Manager" isCollapsed={isCollapsed} />
          <SidebarLink href="#" icon="📁" label="SNS Topics" isCollapsed={isCollapsed} disabled />
        </SidebarGroup>

        <SidebarGroup title="Intelligence" isCollapsed={isCollapsed}>
          <SidebarLink href="/knowledge" icon="🧠" label="Knowledge Graph" isCollapsed={isCollapsed} />
        </SidebarGroup>

        <SidebarGroup title="Accessories" isCollapsed={isCollapsed}>
          <SidebarLink href="/seed-wizard" icon="🪄" label="CSV to Seed Wizard" isCollapsed={isCollapsed} />
          <SidebarLink href="/config-compare" icon="⚙️" label="Config Checker" isCollapsed={isCollapsed} />
          <SidebarLink href="/tenant-compare" icon="🏢" label="Tenant Checker" isCollapsed={isCollapsed} />
          <SidebarLink href="/db-diff" icon="⚖️" label="Database Diff Wizard" isCollapsed={isCollapsed} />
          <SidebarLink href="/terragrunt" icon="🌍" label="Terragrunt Inspector" isCollapsed={isCollapsed} />
          <SidebarLink href="/utilities" icon="🧰" label="PowerToys" isCollapsed={isCollapsed} />
          <SidebarLink href="/sqs" icon="🚀" label="SQS Simulator" isCollapsed={isCollapsed} />
        </SidebarGroup>

      </div>
    </aside>
  );
}

function SidebarGroup({ title, isCollapsed, children }: { title: string, isCollapsed: boolean, children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      {!isCollapsed && <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '8px', color: 'var(--app-text-muted)' }}>[-] {title}</div>}
      {isCollapsed && <div style={{ height: '1px', background: 'var(--app-border)', margin: '8px 0' }} />}
      <div style={{ 
        paddingLeft: isCollapsed ? '0' : '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px',
        alignItems: isCollapsed ? 'center' : 'stretch'
      }}>
        {children}
      </div>
    </div>
  );
}

function SidebarLink({ href, icon, label, isCollapsed, disabled }: { href: string, icon: string, label: string, isCollapsed: boolean, disabled?: boolean }) {
  return (
    <Link 
      href={href} 
      title={isCollapsed ? label : undefined}
      style={{ 
        color: 'var(--app-text)', 
        textDecoration: 'none', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        whiteSpace: 'nowrap'
      }}
    >
      <span style={{ fontSize: '16px' }}>{icon}</span>
      {!isCollapsed && <span style={{ fontSize: '13px' }}>{label}</span>}
    </Link>
  );
}
