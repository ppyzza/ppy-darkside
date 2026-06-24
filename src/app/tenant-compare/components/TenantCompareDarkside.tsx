import React from 'react';
import { TenantCompareProps } from './types';
import { UploadCloud, Database, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

export default function TenantCompareDarkside({
  schema,
  dbRows,
  csvRows,
  comparison,
  finalError,
  handleFileUpload
}: TenantCompareProps) {
  const matches = comparison.filter(c => c.matchStatus === 'Match').length;
  const mismatches = comparison.filter(c => c.matchStatus === 'Mismatch').length;
  const missing = comparison.filter(c => c.matchStatus === 'Missing in DB').length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', gap: '24px', overflow: 'auto', background: 'var(--app-bg)' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--app-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={28} color="var(--app-blue)" />
            Tenant Configuration Sync
          </h1>
          <p style={{ color: 'var(--app-text-muted)', marginTop: '8px' }}>
            Comparing uploaded configuration mapping against schema: <strong>{schema}</strong>
          </p>
        </div>
        
        {/* Upload Card */}
        <div style={{ 
          background: 'var(--app-window-bg)', 
          border: '1px dashed var(--app-border)', 
          borderRadius: '8px',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          position: 'relative'
        }}>
          <UploadCloud size={24} color="var(--app-text-muted)" />
          <span style={{ fontSize: '12px', color: 'var(--app-text)' }}>Upload CSV Mapping</span>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload} 
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
          />
        </div>
      </div>

      {finalError && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--app-danger)', borderRadius: '8px', padding: '16px', color: 'var(--app-danger)' }}>
          <AlertCircle size={20} />
          <span>{finalError}</span>
        </div>
      )}

      {/* Stats Cards */}
      {csvRows.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
          <StatCard title="CSV Records" value={csvRows.length} icon={<Info size={16} />} color="var(--app-blue)" />
          <StatCard title="DB Records" value={dbRows.length} icon={<Database size={16} />} color="var(--app-text-muted)" />
          <StatCard title="Matches" value={matches} icon={<CheckCircle size={16} />} color="var(--app-success)" />
          <StatCard title="Mismatches" value={mismatches} icon={<XCircle size={16} />} color="var(--app-danger)" />
          <StatCard title="Missing" value={missing} icon={<AlertCircle size={16} />} color="var(--app-warning)" />
        </div>
      )}

      {/* Data Table */}
      <div style={{ 
        background: 'var(--app-window-bg)', 
        border: '1px solid var(--app-border)', 
        borderRadius: '8px', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      }}>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--app-panel)', zIndex: 1, boxShadow: '0 1px 0 var(--app-border)' }}>
              <tr>
                <th style={{ padding: '16px', fontWeight: '600', color: 'var(--app-text-muted)', borderBottom: 'none' }}>Module</th>
                <th style={{ padding: '16px', fontWeight: '600', color: 'var(--app-text-muted)', borderBottom: 'none' }}>Config Name</th>
                <th style={{ padding: '16px', fontWeight: '600', color: 'var(--app-text-muted)', borderBottom: 'none' }}>Expected (CSV)</th>
                <th style={{ padding: '16px', fontWeight: '600', color: 'var(--app-text-muted)', borderBottom: 'none' }}>Actual (DB)</th>
                <th style={{ padding: '16px', fontWeight: '600', color: 'var(--app-text-muted)', borderBottom: 'none' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--app-border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--app-text)' }}>{row.module}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--app-blue)' }}>{row.configName}</td>
                  <td style={{ padding: '12px 16px', maxWidth: '250px', wordBreak: 'break-all', color: 'var(--app-text-muted)' }}>{row.csvValue || '-'}</td>
                  <td style={{ padding: '12px 16px', maxWidth: '250px', wordBreak: 'break-all', color: 'var(--app-text)' }}>{row.dbValue !== null ? row.dbValue : '-'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={row.matchStatus} />
                  </td>
                </tr>
              ))}
              {comparison.length === 0 && !finalError && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: 'var(--app-text-muted)' }}>
                    <UploadCloud size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                    <p>No configuration mapped yet. Please upload a CSV to begin comparison.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <div style={{ 
      background: 'var(--app-window-bg)', 
      border: '1px solid var(--app-border)', 
      borderRadius: '8px', 
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--app-text-muted)', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>
        {React.cloneElement(icon as React.ReactElement, { color })}
        {title}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--app-text)' }}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Match') {
    return <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--app-success)', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Match</span>;
  }
  if (status === 'Mismatch') {
    return <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--app-danger)', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> Mismatch</span>;
  }
  return <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--app-warning)', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> Missing</span>;
}
